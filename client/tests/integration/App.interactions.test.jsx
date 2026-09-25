import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { validItinerary } from '../fixtures/itinerary';

describe('App Integration — Interactive Itinerary Operations (Expand, Remove, Reorder)', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: validItinerary,
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function renderWithValidItinerary() {
    const user = userEvent.setup();
    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Plan a trip to Hyderabad');
    await user.click(screen.getByRole('button', { name: /Generate Itinerary/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Hyderabad' })).toBeInTheDocument();
    });

    return user;
  }

  describe('Day Accordion (Expand / Collapse)', () => {
    it('is expanded by default and collapses when the day header is clicked', async () => {
      const user = await renderWithValidItinerary();

      const day1Btn = screen.getByRole('button', { name: /Historic Landmarks and Palaces/i });
      expect(day1Btn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Charminar')).toBeInTheDocument();

      // Click to collapse
      await user.click(day1Btn);
      expect(day1Btn).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Charminar')).not.toBeInTheDocument();

      // Click again to re-expand
      await user.click(day1Btn);
      expect(day1Btn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Charminar')).toBeInTheDocument();
    });
  });

  describe('Remove Stop & State Isolation', () => {
    it('removes a stop immutably from the specified day without mutating other days', async () => {
      const user = await renderWithValidItinerary();

      // Day 1 has Charminar and Chowmahalla Palace
      // Day 2 has Laad Bazaar
      expect(screen.getByText('Charminar')).toBeInTheDocument();
      expect(screen.getByText('Chowmahalla Palace')).toBeInTheDocument();
      expect(screen.getByText('Laad Bazaar')).toBeInTheDocument();

      const removeCharminarBtn = screen.getByRole('button', { name: /Remove stop: Charminar/i });
      await user.click(removeCharminarBtn);

      // Charminar is removed
      expect(screen.queryByText('Charminar')).not.toBeInTheDocument();
      // Chowmahalla Palace remains on Day 1
      expect(screen.getByText('Chowmahalla Palace')).toBeInTheDocument();
      // Day 2 remains intact
      expect(screen.getByText('Laad Bazaar')).toBeInTheDocument();
    });
  });

  describe('Reorder Stops & Boundary Limits', () => {
    it('disables Move Up on the first stop and Move Down on the last stop', async () => {
      await renderWithValidItinerary();

      const moveUpBtns = screen.getAllByRole('button', { name: /Move stop up/i });
      const moveDownBtns = screen.getAllByRole('button', { name: /Move stop down/i });

      // Day 1: Stop 0 (Charminar) is first -> move up disabled
      expect(moveUpBtns[0]).toBeDisabled();
      expect(moveDownBtns[0]).not.toBeDisabled();

      // Day 1: Stop 1 (Chowmahalla Palace) is last -> move down disabled
      expect(moveUpBtns[1]).not.toBeDisabled();
      expect(moveDownBtns[1]).toBeDisabled();
    });

    it('swaps stops within the day when Move Down is clicked and preserves other days', async () => {
      const user = await renderWithValidItinerary();

      // Initially: [Charminar, Chowmahalla Palace]
      let stopNames = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
      expect(stopNames).toEqual(['Charminar', 'Chowmahalla Palace', 'Laad Bazaar']);

      // Click Move Down on Charminar (first moveDown button)
      const moveDownCharminarBtn = screen.getAllByRole('button', { name: /Move stop down/i })[0];
      await user.click(moveDownCharminarBtn);

      // Order becomes: [Chowmahalla Palace, Charminar, Laad Bazaar]
      stopNames = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
      expect(stopNames).toEqual(['Chowmahalla Palace', 'Charminar', 'Laad Bazaar']);
    });

    it('swaps stops within the day when Move Up is clicked', async () => {
      const user = await renderWithValidItinerary();

      // Initially: [Charminar, Chowmahalla Palace]
      // Click Move Up on Chowmahalla Palace (second moveUp button)
      const moveUpChowmahallaBtn = screen.getAllByRole('button', { name: /Move stop up/i })[1];
      await user.click(moveUpChowmahallaBtn);

      // Order becomes: [Chowmahalla Palace, Charminar]
      const stopNames = screen.getAllByRole('heading', { level: 5 }).map((h) => h.textContent);
      expect(stopNames).toEqual(['Chowmahalla Palace', 'Charminar', 'Laad Bazaar']);
    });
  });
});
