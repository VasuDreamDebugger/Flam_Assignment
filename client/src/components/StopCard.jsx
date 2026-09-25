/**
 * StopCard.jsx — Renders a single itinerary stop.
 *
 * Props:
 *   stop        {import('../types/result').Stop} — Stop data from the backend
 *   isFirst     {boolean}   — True if this is the first stop in the day
 *   isLast      {boolean}   — True if this is the last stop in the day
 *   onMoveUp    {() => void} — Move this stop one position earlier
 *   onMoveDown  {() => void} — Move this stop one position later
 *   onRemove    {() => void} — Remove this stop from the day
 *
 * Responsibilities:
 *   - Display name, type badge, description, duration, best time
 *   - Convert durationMinutes to a human-readable string (does NOT mutate stored value)
 *   - Render ↑ / ↓ / Remove action buttons
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an integer number of minutes to a human-readable string.
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

/**
 * @param {{
 *   stop:       import('../types/result').Stop,
 *   isFirst:    boolean,
 *   isLast:     boolean,
 *   onMoveUp:   () => void,
 *   onMoveDown: () => void,
 *   onRemove:   () => void,
 * }} props
 */
export default function StopCard({ stop, isFirst, isLast, onMoveUp, onMoveDown, onRemove }) {
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

      {/* Action controls — move up / move down / remove */}
      <div className="stop-actions">
        <button
          type="button"
          className="stop-action-btn"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move stop up"
          title="Move up"
        >
          ↑
        </button>

        <button
          type="button"
          className="stop-action-btn"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move stop down"
          title="Move down"
        >
          ↓
        </button>

        {/* Spacer pushes Remove to the right */}
        <span className="stop-actions-spacer" aria-hidden="true" />

        <button
          type="button"
          className="stop-action-btn stop-action-btn--remove"
          onClick={onRemove}
          aria-label={`Remove stop: ${stop.name}`}
          title="Remove stop"
        >
          ✕
        </button>
      </div>
    </article>
  );
}
