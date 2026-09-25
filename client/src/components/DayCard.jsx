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

  return (
    <section className="day-card">
      {/*
       * Header — expand/collapse control.
       * <button> (not <div>) for keyboard accessibility.
       */}
      <button
        type="button"
        className="day-card-header"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls={`day-body-${day.dayNumber}`}
        id={`day-header-${day.dayNumber}`}
      >
        <div className="day-card-header-left">
          <div className="day-number-badge" aria-hidden="true">
            {day.dayNumber}
          </div>
          <div className="day-title-wrap">
            <div className="day-title">{day.title}</div>
            <div className="day-stop-count">
              {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
            </div>
          </div>
        </div>

        {/* Chevron indicator */}
        <span
          className={`day-toggle-icon ${expanded ? 'expanded' : 'collapsed'}`}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      {/* Collapsible body */}
      {expanded && (
        <div
          className="day-card-body"
          id={`day-body-${day.dayNumber}`}
          role="region"
          aria-labelledby={`day-header-${day.dayNumber}`}
        >
          {day.summary && (
            <p className="day-summary">{day.summary}</p>
          )}

          {stopCount > 0 ? (
            stops.map((stop, index) => (
              // Stable key from backend id — never use array index
              <StopCard
                key={stop.id}
                stop={stop}
                isFirst={index === 0}
                isLast={index === stopCount - 1}
                onMoveUp={() => onMoveStop(stop.id, 'up')}
                onMoveDown={() => onMoveStop(stop.id, 'down')}
                onRemove={() => onRemoveStop(stop.id)}
              />
            ))
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
