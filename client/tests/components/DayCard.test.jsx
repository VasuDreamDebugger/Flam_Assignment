import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayCard from '../../src/components/DayCard';
import { validItinerary } from '../fixtures/itinerary';

describe('DayCard Component', () => {
  const mockDay = validItinerary.days[0];
  const onRemoveStop = vi.fn();
  const onMoveStop = vi.fn();

  it('renders day anchor number padded with zero (01), title, and summary', () => {
    render(
      <DayCard
        day={mockDay}
        onRemoveStop={onRemoveStop}
        onMoveStop={onMoveStop}
      />
    );

    expect(screen.getAllByText('01')[0]).toBeInTheDocument();
    expect(screen.getByText('DAY 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: mockDay.title })).toBeInTheDocument();
    expect(screen.getByText(mockDay.summary)).toBeInTheDocument();
    expect(screen.getByText('2 stops')).toBeInTheDocument();
  });

  it('toggles expansion state and updates aria attributes', async () => {
    const user = userEvent.setup();

    render(
      <DayCard
        day={mockDay}
        onRemoveStop={onRemoveStop}
        onMoveStop={onMoveStop}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /Historic Landmarks and Palaces/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region')).toBeInTheDocument();

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('displays notice when day has no stops', () => {
    const emptyDay = {
      ...mockDay,
      stops: [],
    };

    render(
      <DayCard
        day={emptyDay}
        onRemoveStop={onRemoveStop}
        onMoveStop={onMoveStop}
      />
    );

    expect(screen.getByText(/No stops planned for this day/i)).toBeInTheDocument();
    expect(screen.getByText('0 stops')).toBeInTheDocument();
  });
});
