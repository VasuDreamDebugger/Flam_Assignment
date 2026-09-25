/**
 * StopCard.jsx — Renders a single itinerary stop.
 *
 * Props:
 *   stop        {import('../types/result').Stop} — Stop data from the backend
 *   index       {number}    — Zero-based index of this stop within the day
 *   isFirst     {boolean}   — True if this is the first stop in the day
 *   isLast      {boolean}   — True if this is the last stop in the day
 *   onMoveUp    {() => void} — Move this stop one position earlier
 *   onMoveDown  {() => void} — Move this stop one position later
 *   onRemove    {() => void} — Remove this stop from the day
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
 *   index:      number,
 *   isFirst:    boolean,
 *   isLast:     boolean,
 *   onMoveUp:   () => void,
 *   onMoveDown: () => void,
 *   onRemove:   () => void,
 * }} props
 */
export default function StopCard({ stop, index = 0, isFirst, isLast, onMoveUp, onMoveDown, onRemove }) {
  const formattedStopNum = String(index + 1).padStart(2, '0');

  return (
    <article className="stop-card">
      <div className="stop-card-inner">
        {/* Left sequential index */}
        <div className="stop-number-col" aria-hidden="true">
          <span className="stop-index">{formattedStopNum}</span>
        </div>

        {/* Center content */}
        <div className="stop-content-col">
          <div className="stop-headline">
            <h5 className="stop-name">{stop.name}</h5>
            <span className={`stop-type-badge stop-type--${stop.type}`}>
              {stop.type}
            </span>
          </div>

          <p className="stop-description">{stop.description}</p>

          <div className="stop-meta-row">
            <span className="stop-meta-item">
              <span className="stop-meta-icon" aria-hidden="true">⏱</span>
              {formatDuration(stop.durationMinutes)}
            </span>
            <span className="stop-meta-divider" aria-hidden="true">•</span>
            <span className="stop-meta-item">
              <span className="stop-meta-icon" aria-hidden="true">🕐</span>
              {formatBestTime(stop.bestTime)}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="stop-actions-col">
          <div className="stop-reorder-group" role="group" aria-label="Reorder stop">
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
          </div>

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
      </div>
    </article>
  );
}

