import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { validItinerary } from '../fixtures/itinerary';

describe('App Integration — Error Retry Flow & Input Preservation', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves user prompt and successfully renders itinerary on retry', async () => {
    const user = userEvent.setup();

    // 1st request fails
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        error: { code: 'LLM_UNAVAILABLE', message: 'Gemini high demand' },
      }),
    });

    render(<App />);

    const promptText = 'Plan a 2-day historical tour of Hyderabad';
    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, promptText);
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    // Error appears
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

    // Prompt is preserved
    expect(textarea).toHaveValue(promptText);

    // 2nd request on retry succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: validItinerary,
      }),
    });

    // Click retry
    await user.click(screen.getByRole('button', { name: /Try Again/i }));

    // Verify 2nd fetch called with exact same prompt
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [, secondCallOptions] = global.fetch.mock.calls[1];
    expect(JSON.parse(secondCallOptions.body)).toEqual({ input: promptText });

    // Itinerary is rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hyderabad' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('remains stable across consecutive failures and retries', async () => {
    const user = userEvent.setup();

    // 1st failure
    global.fetch.mockRejectedValueOnce(new TypeError('Network error'));
    // 2nd failure
    global.fetch.mockRejectedValueOnce(new TypeError('Network error'));

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Tokyo trip');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Retry fails again
    await user.click(screen.getByRole('button', { name: /Try Again/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to reach the server/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
