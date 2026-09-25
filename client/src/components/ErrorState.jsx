/**
 * ErrorState.jsx — Displays a user-friendly error when generation fails.
 *
 * Props:
 *   title    {string}   — Optional custom title (defaults to "Something went wrong")
 *   message  {string}   — User-safe message to display
 *   onRetry  {Function} — Optional callback to retry the last request
 */

/** @param {{ title?: string, message?: string, onRetry?: () => void }} props */
export default function ErrorState({ title, message, onRetry }) {
  let resolvedTitle = title;
  let resolvedMessage = message;

  if (typeof message === 'object' && message !== null) {
    resolvedTitle = message.title || title;
    resolvedMessage = message.message;
  }

  const displayTitle =
    typeof resolvedTitle === 'string' && resolvedTitle.trim()
      ? resolvedTitle
      : 'Something went wrong';

  const displayMessage =
    typeof resolvedMessage === 'string' && resolvedMessage.trim()
      ? resolvedMessage
      : "We couldn't generate your itinerary.\nPlease try again.";

  return (
    <div className="error-state" role="alert">
      <span className="error-icon" aria-hidden="true">
        ⚠️
      </span>

      <h2 className="error-title">{displayTitle}</h2>

      <p className="error-message">{displayMessage}</p>

      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} type="button">
          Try Again
        </button>
      )}
    </div>
  );
}
