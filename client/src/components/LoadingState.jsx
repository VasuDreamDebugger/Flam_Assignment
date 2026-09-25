/**
 * LoadingState.jsx — Shown while the backend is generating the itinerary.
 *
 * Responsibilities:
 *   - Communicate clearly that generation is in progress
 *   - Keep the user informed so they don't think the app is broken
 *   - No props required; it is a pure presentational component
 */
export default function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />

      <div className="loading-pulse-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <p className="loading-title">Crafting your itinerary…</p>
      <p className="loading-subtitle">
        Our AI is planning your perfect trip. This usually takes 5–15 seconds.
      </p>
    </div>
  );
}
