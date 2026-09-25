import DayCard from './DayCard';

/**
 * ResultView.jsx — Renders the full trip itinerary.
 *
 * Props:
 *   itinerary {import('../types/result').TripData} — Validated trip data
 *
 * Responsibilities:
 *   - Display trip-level metadata (destination, duration, summary)
 *   - Render each DayCard in order
 *   - Does NOT own itinerary state — it is passed down from App
 */

/** @param {{ itinerary: import('../types/result').TripData }} props */
export default function ResultView({ itinerary }) {
  const { trip, days } = itinerary;

  return (
    <section className="result-view" aria-label="Trip itinerary">

      {/* Trip-level header */}
      <header className="trip-header">
        <h2 className="trip-destination">{trip.destination}</h2>

        <div className="trip-meta">
          <span className="trip-meta-badge">
            <span aria-hidden="true">📅</span>
            {trip.durationDays} {trip.durationDays === 1 ? 'day' : 'days'}
          </span>
          <span className="trip-meta-badge">
            <span aria-hidden="true">📍</span>
            {trip.destination}
          </span>
          <span className="trip-meta-badge">
            <span aria-hidden="true">🗺</span>
            {days.length} {days.length === 1 ? 'day planned' : 'days planned'}
          </span>
        </div>

        {trip.summary && (
          <p className="trip-summary">{trip.summary}</p>
        )}
      </header>

      {/* Days list */}
      {days.length > 0 ? (
        <div>
          <p className="days-section-label">Day-by-day itinerary</p>
          <div className="days-list" style={{ marginTop: '16px' }}>
            {days.map((day) => (
              // Stable key: dayNumber is sequential and unique per trip
              <DayCard key={day.dayNumber} day={day} />
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          No days were generated for this trip.
        </p>
      )}
    </section>
  );
}
