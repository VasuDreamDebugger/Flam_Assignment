import { useState } from 'react';

import PromptInput  from './components/PromptInput';
import LoadingState from './components/LoadingState';
import ErrorState   from './components/ErrorState';
import ResultView   from './components/ResultView';

import { generateItinerary, ApiError } from './lib/api';

/**
 * App.jsx — Root component and state orchestrator.
 *
 * Owns all application-level state:
 *   input      — the user's trip request text (controlled input)
 *   itinerary  — the structured trip data returned by the backend
 *   loading    — true while a /generate request is in-flight
 *   error      — user-safe error message, or null
 *
 * UI-only state (e.g. DayCard expand/collapse) lives inside those components.
 *
 * Flow:
 *   PromptInput → handleGenerate() → api.generateItinerary()
 *     → success → setItinerary(data)
 *     → failure → setError(message)
 */
export default function App() {
  // --- Application state ---------------------------------------------------
  const [input,     setInput]     = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // -------------------------------------------------------------------------
  // handleGenerate — called when the user submits the prompt
  // -------------------------------------------------------------------------
  async function handleGenerate() {
    // Basic empty-input guard — prevents an unnecessary API call
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    // Clear the previous itinerary so the UI doesn't show stale data
    setItinerary(null);

    try {
      const data = await generateItinerary(input.trim());
      setItinerary(data);
    } catch (err) {
      // Log the technical detail for development debugging
      console.error('[App] Generation error:', err);

      // Show a user-safe message — never expose API keys or raw stack traces
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We couldn't generate your itinerary. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // handleRetry — passed to ErrorState so the user can retry without
  // clearing their input
  // -------------------------------------------------------------------------
  function handleRetry() {
    setError(null);
    handleGenerate();
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="app-shell">

      {/* Sticky header */}
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo-icon" aria-hidden="true">✈</span>
          <span className="app-logo">AI Trip Planner</span>
        </div>
      </header>

      <main className="app-main">

        {/* Hero section — visible only before any result is shown */}
        {!itinerary && !loading && !error && (
          <div className="hero">
            <h1 className="hero-title">Plan your perfect trip with AI</h1>
            <p className="hero-subtitle">
              Describe your ideal journey in plain English. Get a personalised,
              day-by-day itinerary in seconds — powered by Gemini.
            </p>
          </div>
        )}

        {/* Prompt input — always visible */}
        <PromptInput
          value={input}
          onChange={setInput}
          onSubmit={handleGenerate}
          loading={loading}
        />

        {/* Loading state */}
        {loading && <LoadingState />}

        {/* Error state */}
        {!loading && error && (
          <ErrorState message={error} onRetry={handleRetry} />
        )}

        {/* Result view */}
        {!loading && !error && itinerary && (
          <ResultView itinerary={itinerary} />
        )}

      </main>
    </div>
  );
}
