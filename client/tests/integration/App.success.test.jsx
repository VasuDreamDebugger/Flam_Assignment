import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { validItinerary } from '../fixtures/itinerary';

describe('App Integration — Successful Flow & Rendering', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state with hero, prompt input, and submit button', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Plan your perfect trip with AI/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Trip request/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Itinerary/i })).toBeInTheDocument();
  });

  it('completes the full flow: prompt input -> generate -> loading -> valid itinerary rendered', async () => {
    const user = userEvent.setup();

    let resolvePromise;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    global.fetch.mockReturnValueOnce(fetchPromise);

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Plan a 2-day trip to Hyderabad');

    const submitBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
    await user.click(submitBtn);

    // Verify loading appears while promise is pending
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Crafting your itinerary…/i)).toBeInTheDocument();

    // Resolve backend response
    resolvePromise({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: validItinerary,
      }),
    });

    // Wait for itinerary to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hyderabad' })).toBeInTheDocument();
    });

    // Check Trip Overview metadata
    expect(screen.getByText(/2 DAYS PLANNED/i)).toBeInTheDocument();
    expect(screen.getByText('HYDERABAD')).toBeInTheDocument();
    expect(screen.getByText(validItinerary.trip.summary)).toBeInTheDocument();

    // Check Day 1
    expect(screen.getByRole('heading', { name: 'Historic Landmarks and Palaces' })).toBeInTheDocument();
    expect(screen.getByText('Charminar')).toBeInTheDocument();
    expect(screen.getByText('Chowmahalla Palace')).toBeInTheDocument();

    // Check Day 2
    expect(screen.getByRole('heading', { name: 'Bazaars and Hyderabadi Cuisine' })).toBeInTheDocument();
    expect(screen.getByText('Laad Bazaar')).toBeInTheDocument();

    // Hero title is now hidden
    expect(screen.queryByRole('heading', { name: /Plan your perfect trip with AI/i })).not.toBeInTheDocument();
  });

  it('submits on keyboard shortcut Ctrl+Enter', async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: validItinerary,
      }),
    });

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Explore Hyderabad');
    await user.keyboard('{Control>}{Enter}{/Control}');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hyderabad' })).toBeInTheDocument();
    });
  });

  it('toggles theme between dark and light, persisting in localStorage', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const shell = container.querySelector('.app-shell');
    expect(shell).toHaveAttribute('data-theme', 'dark');

    const toggleBtn = screen.getByRole('button', { name: /Switch to light mode/i });
    await user.click(toggleBtn);

    expect(shell).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('flam_theme')).toBe('light');

    await user.click(toggleBtn);
    expect(shell).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('flam_theme')).toBe('dark');
  });
});
