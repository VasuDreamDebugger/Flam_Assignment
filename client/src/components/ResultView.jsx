import DayCard from './DayCard';

/**
 * ResultView.jsx — Renders the full trip itinerary.
 *
 * Props:
 *   itinerary    {import('../types/result').TripData}
 *   onRemoveStop {(dayNumber: number, stopId: string) => void}
 *   onMoveStop   {(dayNumber: number, stopId: string, direction: 'up'|'down') => void}
 *
 * Purely presentational — owns no state.
 * Threads callbacks from App down to DayCard.
 */

/**
 * @param {{
 *   itinerary:    import('../types/result').TripData,
 *   onRemoveStop: (dayNumber: number, stopId: string) => void,
 *   onMoveStop:   (dayNumber: number, stopId: string, direction: 'up'|'down') => void,
 * }} props
 */
export default function ResultView({ itinerary, onRemoveStop, onMoveStop }) {
  const { trip, days } = itinerary;

  return (
    <section className="result-view" aria-label="Trip itinerary">

      {/* Trip overview / Editorial hero */}
      <header className="trip-overview">
        <div className="trip-overview-top">
          <span className="trip-overview-label">TRIP OVERVIEW</span>
          <h2 className="trip-destination">{trip.destination}</h2>
        </div>

        <div className="trip-meta-bar">
          <span className="trip-meta-item">
            <span className="trip-meta-icon" aria-hidden="true">📅</span>
            {trip.durationDays} {trip.durationDays === 1 ? 'DAY' : 'DAYS'}
          </span>
          <span className="trip-meta-separator" aria-hidden="true">•</span>
          <span className="trip-meta-item">
            <span className="trip-meta-icon" aria-hidden="true">📍</span>
            {trip.destination.toUpperCase()}
          </span>
          <span className="trip-meta-separator" aria-hidden="true">•</span>
          <span className="trip-meta-item">
            <span className="trip-meta-icon" aria-hidden="true">🗺</span>
            {days.length} {days.length === 1 ? 'DAY PLANNED' : 'DAYS PLANNED'}
          </span>
        </div>

        {trip.summary && (
          <p className="trip-summary">{trip.summary}</p>
        )}
      </header>

      {/* Itinerary section */}
      <div className="itinerary-section">
        <div className="itinerary-section-header">
          <span className="itinerary-section-tag">ITINERARY</span>
          <h3 className="itinerary-section-title">Day-by-day plan</h3>
        </div>

        {days.length > 0 ? (
          <div className="days-list">
            {days.map((day) => (
              // Stable key — dayNumber is sequential and unique per trip
              <DayCard
                key={day.dayNumber}
                day={day}
                onRemoveStop={(stopId) => onRemoveStop(day.dayNumber, stopId)}
                onMoveStop={(stopId, direction) => onMoveStop(day.dayNumber, stopId, direction)}
              />
            ))}
          </div>
        ) : (
          <p className="no-days-notice">
            No days were generated for this trip.
          </p>
        )}
      </div>
    </section>
  );
}

