import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { validItinerary, valid3DayItinerary } from '../fixtures/itinerary';

function createDeferredPromise() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('App Integration — Stale Response & Race Condition Protection', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores an older in-flight response (Request A) when a newer request (Request B) resolves first', async () => {
    const user = userEvent.setup();

    const requestA = createDeferredPromise();
    const requestB = createDeferredPromise();

    // 1st call -> Request A (slow)
    // 2nd call -> Request B (fast)
    global.fetch
      .mockReturnValueOnce(requestA.promise)
      .mockReturnValueOnce(requestB.promise);

    const { container } = render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    const form = container.querySelector('.prompt-form');

    // User submits Request A
    await user.type(textarea, 'Plan a trip to Hyderabad');
    fireEvent.submit(form);

    // Rapid second dispatch (Request B) while Request A is still pending
    fireEvent.change(textarea, { target: { value: 'Plan a trip to Kyoto' } });
    fireEvent.submit(form);

    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Request B (Kyoto) resolves FIRST
    await act(async () => {
      requestB.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: valid3DayItinerary, // Kyoto
        }),
      });
    });

    // Verify Kyoto is rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Kyoto' })).toBeInTheDocument();
    });

    // Request A (Hyderabad) resolves LATER
    await act(async () => {
      requestA.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: validItinerary, // Hyderabad
        }),
      });
    });

    // CRITICAL: The displayed itinerary must still be KYOTO, NOT overwritten by Hyderabad
    expect(screen.getByRole('heading', { name: 'Kyoto' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hyderabad' })).not.toBeInTheDocument();
  });

  it('does not allow an older successful response (Request A) to overwrite a newer failed request (Request B)', async () => {
    const user = userEvent.setup();

    const requestA = createDeferredPromise();
    const requestB = createDeferredPromise();

    global.fetch
      .mockReturnValueOnce(requestA.promise)
      .mockReturnValueOnce(requestB.promise);

    const { container } = render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    const form = container.querySelector('.prompt-form');

    // Request A starts
    await user.type(textarea, 'Plan a trip to Hyderabad');
    fireEvent.submit(form);

    // Request B starts
    fireEvent.change(textarea, { target: { value: 'Plan a trip to London' } });
    fireEvent.submit(form);

    // Request B fails with 503 LLM_UNAVAILABLE
    await act(async () => {
      requestB.resolve({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: { code: 'LLM_UNAVAILABLE', message: 'High demand' },
        }),
      });
    });

    // Request B error is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /The AI model is experiencing high traffic/i })).toBeInTheDocument();

    // Request A resolves successfully after Request B's failure
    await act(async () => {
      requestA.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: validItinerary, // Hyderabad
        }),
      });
    });

    // CRITICAL: The error state for Request B must persist and NOT be overwritten by stale Request A
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hyderabad' })).not.toBeInTheDocument();
  });
});
