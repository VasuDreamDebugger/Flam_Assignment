import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('App Integration — Backend, LLM & Network Error Handling', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays user-friendly message on 503 LLM_UNAVAILABLE', async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: 'Gemini is currently experiencing high demand.',
        },
      }),
    });

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Plan a trip to Goa');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /The AI model is experiencing high traffic/i })).toBeInTheDocument();
    expect(screen.getByText(/Gemini is temporarily unavailable due to high demand/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('displays error on 400 Invalid Input', async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Input cannot be empty.',
        },
      }),
    });

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'short');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Please enter a trip description before generating an itinerary/i)).toBeInTheDocument();
  });

  it('displays server error message on 500 Internal Server Error', async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error.',
        },
      }),
    });

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Tokyo');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Something went wrong on our server/i)).toBeInTheDocument();
  });

  it('handles network failure (fetch throws) without crashing and shows connection message', async () => {
    const user = userEvent.setup();

    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'London');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to reach the server. Please check your connection and try again./i)).toBeInTheDocument();
  });

  it('handles unreadable non-JSON server response', async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('Unexpected token');
      },
    });

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Rome');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/We couldn't generate your itinerary/i)).toBeInTheDocument();
  });
});
