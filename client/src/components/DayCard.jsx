import { useState } from 'react';
import StopCard from './StopCard';

/**
 * DayCard.jsx — Renders one day of the trip itinerary.
 *
 * Props:
 *   day          {import('../types/result').Day} — Day data from the backend
 *   onRemoveStop {(stopId: string) => void}      — Remove a stop by ID
 *   onMoveStop   {(stopId: string, direction: 'up'|'down') => void} — Reorder
 *
 * Local state:
 *   expanded {boolean} — UI-only expand/collapse; never stored in itinerary data.
 */

/**
 * @param {{
 *   day: import('../types/result').Day,
 *   onRemoveStop: (stopId: string) => void,
 *   onMoveStop: (stopId: string, direction: 'up'|'down') => void,
 * }} props
 */
export default function DayCard({ day, onRemoveStop, onMoveStop }) {
  // Expand by default so the user immediately sees content
  const [expanded, setExpanded] = useState(true);

  function toggleExpanded() {
    setExpanded((prev) => !prev);
  }

  const stops = day.stops ?? [];
  const stopCount = stops.length;
  const formattedDayNum = String(day.dayNumber).padStart(2, '0');

  return (
    <section className={`day-section ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
      {/*
       * Header — expand/collapse control.
       * <button> for full keyboard accessibility.
       */}
      <button
        type="button"
        className="day-header-btn"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls={`day-body-${day.dayNumber}`}
        id={`day-header-${day.dayNumber}`}
      >
        <div className="day-header-left">
          {/* Day anchor number */}
          <div className="day-anchor">
            <span className="day-anchor-num">{formattedDayNum}</span>
            <span className="day-anchor-label">DAY {day.dayNumber}</span>
          </div>

          <div className="day-heading-block">
            <h4 className="day-title">{day.title}</h4>
            {day.summary && (
              <p className="day-summary">{day.summary}</p>
            )}
          </div>
        </div>

        <div className="day-header-right">
          <span className="day-stops-badge">
            {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
          </span>
          <span
            className={`day-toggle-arrow ${expanded ? 'expanded' : 'collapsed'}`}
            aria-hidden="true"
          >
            ›
          </span>
        </div>
      </button>

      {/* Collapsible body */}
      {expanded && (
        <div
          className="day-body"
          id={`day-body-${day.dayNumber}`}
          role="region"
          aria-labelledby={`day-header-${day.dayNumber}`}
        >
          {stopCount > 0 ? (
            <div className="stops-list">
              {stops.map((stop, index) => (
                // Stable key from backend id — never use array index
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === stopCount - 1}
                  onMoveUp={() => onMoveStop(stop.id, 'up')}
                  onMoveDown={() => onMoveStop(stop.id, 'down')}
                  onRemove={() => onRemoveStop(stop.id)}
                />
              ))}
            </div>
          ) : (
            <p className="day-empty-notice">
              No stops planned for this day.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

