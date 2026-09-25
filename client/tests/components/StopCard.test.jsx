import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StopCard from '../../src/components/StopCard';
import { validItinerary } from '../fixtures/itinerary';

describe('StopCard Component', () => {
  const mockStop = validItinerary.days[0].stops[0]; // Charminar: culture, 90 mins, morning
  const onMoveUp = vi.fn();
  const onMoveDown = vi.fn();
  const onRemove = vi.fn();

  it('renders sequential stop index (01), name, description, category badge, and metadata', () => {
    render(
      <StopCard
        stop={mockStop}
        index={0}
        isFirst={true}
        isLast={false}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Charminar' })).toBeInTheDocument();
    expect(screen.getByText(mockStop.description)).toBeInTheDocument();
    expect(screen.getByText('culture')).toBeInTheDocument();
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
    expect(screen.getByText('Morning')).toBeInTheDocument();
  });

  it('formats various durations properly (hours only, minutes only)', () => {
    const stop60m = { ...mockStop, durationMinutes: 60 };
    const { rerender } = render(
      <StopCard
        stop={stop60m}
        index={1}
        isFirst={false}
        isLast={false}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('1h')).toBeInTheDocument();

    const stop45m = { ...mockStop, durationMinutes: 45 };
    rerender(
      <StopCard
        stop={stop45m}
        index={1}
        isFirst={false}
        isLast={false}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  it('formats all bestTime labels correctly', () => {
    const times = [
      { key: 'early-morning', label: 'Early Morning' },
      { key: 'morning', label: 'Morning' },
      { key: 'afternoon', label: 'Afternoon' },
      { key: 'evening', label: 'Evening' },
      { key: 'night', label: 'Night' },
    ];

    for (const { key, label } of times) {
      const stop = { ...mockStop, bestTime: key };
      const { unmount } = render(
        <StopCard
          stop={stop}
          index={0}
          isFirst={false}
          isLast={false}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
        />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('disables move up when isFirst is true and calls onMoveDown / onRemove on click', async () => {
    const user = userEvent.setup();

    render(
      <StopCard
        stop={mockStop}
        index={0}
        isFirst={true}
        isLast={false}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
    );

    const moveUpBtn = screen.getByRole('button', { name: /Move stop up/i });
    const moveDownBtn = screen.getByRole('button', { name: /Move stop down/i });
    const removeBtn = screen.getByRole('button', { name: /Remove stop: Charminar/i });

    expect(moveUpBtn).toBeDisabled();
    expect(moveDownBtn).not.toBeDisabled();

    await user.click(moveDownBtn);
    expect(onMoveDown).toHaveBeenCalledTimes(1);

    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
