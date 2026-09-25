import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { validItinerary } from '../fixtures/itinerary';

describe('App Integration — Loading States & In-Flight Request Handling', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays loading indicator and disables controls during an in-flight request', async () => {
    const user = userEvent.setup();

    let resolvePromise;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    global.fetch.mockReturnValueOnce(fetchPromise);

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    const submitBtn = screen.getByRole('button', { name: /Generate Itinerary/i });

    await user.type(textarea, 'Plan a trip to Singapore');
    await user.click(submitBtn);

    // During in-flight request
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Crafting your itinerary…/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'true');
    expect(textarea).toBeDisabled();

    // Prevent duplicate submission on extra clicks
    await user.click(submitBtn);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Resolve the promise
    resolvePromise({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: validItinerary,
      }),
    });

    // After resolution
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Hyderabad' })).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
    expect(textarea).not.toBeDisabled();
  });

  it('clears loading and re-enables controls when request fails', async () => {
    const user = userEvent.setup();

    let rejectPromise;
    const fetchPromise = new Promise((_, reject) => {
      rejectPromise = reject;
    });

    global.fetch.mockReturnValueOnce(fetchPromise);

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    const submitBtn = screen.getByRole('button', { name: /Generate Itinerary/i });

    await user.type(textarea, 'Test trip');
    await user.click(submitBtn);

    expect(screen.getByRole('status')).toBeInTheDocument();

    rejectPromise(new TypeError('Network failure'));

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
    expect(textarea).not.toBeDisabled();
  });
});
