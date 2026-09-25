import { useState, useRef } from 'react';

import PromptInput  from './components/PromptInput';
import LoadingState from './components/LoadingState';
import ErrorState   from './components/ErrorState';
import ResultView   from './components/ResultView';

import { generateItinerary, getUserFriendlyError } from './lib/api';
import { validateTrip } from './lib/validateTrip';

/**
 * App.jsx — Root component and state orchestrator.
 *
 * Application-level state (single source of truth):
 *   input      — the user's trip request text (controlled input)
 *   itinerary  — the structured trip data returned by the backend
 *   loading    — true while a /generate request is in-flight
 *   error      — user-safe error object { title, message }, or null
 *
 * UI-only state (expand/collapse) lives inside DayCard — not here.
 *
 * Part 2 additions:
 *   handleRemoveStop(dayNumber, stopId) — immutable remove
 *   handleMoveStop(dayNumber, stopId, direction) — immutable reorder
 *
 * Part 3 additions:
 *   Zod structural + custom validation pipeline before setting itinerary state
 *   Stale-request protection via requestIdRef
 */
export default function App() {
  // --- Application state ---------------------------------------------------
  const [input,     setInput]     = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // Theme state: dark (default) or light, persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('flam_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  function toggleTheme() {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('flam_theme', nextTheme);
      } catch {
        // ignore storage errors
      }
      return nextTheme;
    });
  }

  // Request counter to ignore stale out-of-order responses
  const requestIdRef = useRef(0);

  // -------------------------------------------------------------------------
  // handleGenerate — called when the user submits the prompt
  // -------------------------------------------------------------------------
  async function handleGenerate() {
    if (!input.trim()) return;

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await generateItinerary(input.trim());

      // If a newer request was dispatched while this was in-flight, ignore response
      if (currentRequestId !== requestIdRef.current) return;

      // Validate untrusted AI response against Zod + custom domain rules
      const validation = validateTrip(data);
      if (!validation.valid) {
        console.error('[App] Validation failed:', validation.error, validation.reason, validation.issues);
        setError({
          title: 'We received an invalid itinerary',
          message:
            "The AI returned data that doesn't match the itinerary requirements.\nPlease try generating the trip again.",
        });
        return;
      }

      // Use only the validated data
      setItinerary(validation.data);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error('[App] Generation error:', err);
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  // -------------------------------------------------------------------------
  // handleRetry
  // -------------------------------------------------------------------------
  function handleRetry() {
    setError(null);
    handleGenerate();
  }

  // -------------------------------------------------------------------------
  // handleRemoveStop — remove a single stop from a day (immutable)
  //
  // Only the affected day gets a new reference.
  // All other days keep their existing object references.
  // -------------------------------------------------------------------------
  function handleRemoveStop(dayNumber, stopId) {
    setItinerary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) => {
          if (day.dayNumber !== dayNumber) return day; // unchanged reference
          return {
            ...day,
            stops: day.stops.filter((stop) => stop.id !== stopId),
          };
        }),
      };
    });
  }

  // -------------------------------------------------------------------------
  // handleMoveStop — reorder a stop within a day (immutable)
  //
  // direction: 'up' moves the stop one index earlier,
  //            'down' moves it one index later.
  //
  // Only the affected day gets a new reference.
  // -------------------------------------------------------------------------
  function handleMoveStop(dayNumber, stopId, direction) {
    setItinerary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) => {
          if (day.dayNumber !== dayNumber) return day; // unchanged reference

          const stops = day.stops;
          const index = stops.findIndex((s) => s.id === stopId);

          // Guard: out of bounds moves are silently ignored
          if (direction === 'up'   && index <= 0)                return day;
          if (direction === 'down' && index >= stops.length - 1) return day;

          const newStops = [...stops];
          const swapIndex = direction === 'up' ? index - 1 : index + 1;

          // Swap the two stops
          [newStops[index], newStops[swapIndex]] = [newStops[swapIndex], newStops[index]];

          return { ...day, stops: newStops };
        }),
      };
    });
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="app-shell" data-theme={theme}>

      {/* Sticky header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-brand">
            <span className="app-logo-icon" aria-hidden="true">✈</span>
            <span className="app-logo">AI Trip Planner</span>
          </div>

          {/* Theme switcher */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="theme-toggle-label">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
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
          <ErrorState
            title={error.title}
            message={error.message}
            onRetry={handleRetry}
          />
        )}

        {/* Result view */}
        {!loading && !error && itinerary && (
          <ResultView
            itinerary={itinerary}
            onRemoveStop={handleRemoveStop}
            onMoveStop={handleMoveStop}
          />
        )}

      </main>
    </div>
  );
}
