/**
 * ErrorState.jsx — Displays a user-friendly error when generation fails.
 *
 * Props:
 *   message  {string}   — User-safe message to display (from App state)
 *   onRetry  {Function} — Optional callback to retry the last request
 */

/** @param {{ message: string, onRetry?: () => void }} props */
export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-icon" aria-hidden="true">⚠️</span>

      <h2 className="error-title">Something went wrong</h2>

      <p className="error-message">
        {message || "We couldn't generate your itinerary. Please try again."}
      </p>

      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}
