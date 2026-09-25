import { useState } from 'react';
import StopCard from './StopCard';

/**
 * DayCard.jsx — Renders one day of the trip itinerary.
 *
 * Props:
 *   day {import('../types/result').Day} — Day data from the backend
 *
 * Local state:
 *   expanded {boolean} — Whether the day body is visible.
 *   UI-only state kept local; does NOT need to live in App.
 */

/** @param {{ day: import('../types/result').Day }} props */
export default function DayCard({ day }) {
  // Expand by default so the user immediately sees content
  const [expanded, setExpanded] = useState(true);

  function toggleExpanded() {
    setExpanded((prev) => !prev);
  }

  const stopCount = day.stops?.length ?? 0;

  return (
    <section className="day-card">
      {/*
       * Header — acts as the expand/collapse control.
       * Using a <button> (not a <div>) for keyboard accessibility.
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
            <div className="day-title">
              {day.title}
            </div>
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
            day.stops.map((stop) => (
              // Stable key from backend — never use array index here
              <StopCard key={stop.id} stop={stop} />
            ))
          ) : (
            <p className="day-summary" style={{ fontStyle: 'italic' }}>
              No stops for this day.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
