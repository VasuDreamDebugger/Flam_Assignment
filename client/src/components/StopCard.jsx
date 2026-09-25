/**
 * StopCard.jsx — Renders a single itinerary stop.
 *
 * Props:
 *   stop {import('../types/result').Stop} — Stop data from the backend
 *
 * Responsibilities:
 *   - Display name, type badge, description, duration, best time
 *   - Convert durationMinutes to a human-readable string
 *   - Does NOT modify the stored value (durationMinutes remains a number)
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an integer number of minutes to a human-readable string.
 *
 * Examples:
 *   90  → "1h 30m"
 *   60  → "1h"
 *   45  → "45m"
 *   150 → "2h 30m"
 *
 * @param {number} minutes
 * @returns {string}
 */
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Returns a friendly label for the bestTime enum value.
 *
 * @param {import('../types/result').BestTime} bestTime
 * @returns {string}
 */
function formatBestTime(bestTime) {
  const labels = {
    'early-morning': 'Early Morning',
    morning:         'Morning',
    afternoon:       'Afternoon',
    evening:         'Evening',
    night:           'Night',
  };
  return labels[bestTime] ?? bestTime;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** @param {{ stop: import('../types/result').Stop }} props */
export default function StopCard({ stop }) {
  return (
    <article className="stop-card">
      {/* Header: name + type badge */}
      <div className="stop-header">
        <h4 className="stop-name">{stop.name}</h4>
        <span className={`stop-type-badge stop-type--${stop.type}`}>
          {stop.type}
        </span>
      </div>

      {/* Description */}
      <p className="stop-description">{stop.description}</p>

      {/* Meta row: duration + best time */}
      <div className="stop-meta">
        <span className="stop-meta-item">
          <span className="stop-meta-icon" aria-hidden="true">⏱</span>
          {formatDuration(stop.durationMinutes)}
        </span>
        <span className="stop-meta-item">
          <span className="stop-meta-icon" aria-hidden="true">🕐</span>
          {formatBestTime(stop.bestTime)}
        </span>
      </div>
    </article>
  );
}
