/**
 * PromptInput.jsx — Free-form text input for the trip request.
 *
 * Props:
 *   value      {string}            — Controlled textarea value
 *   onChange   {(v: string) => void} — Called on every keystroke
 *   onSubmit   {() => void}        — Called when the user submits
 *   loading    {boolean}           — Disables the form while generating
 */

/** @param {{ value: string, onChange: (v: string) => void, onSubmit: () => void, loading: boolean }} props */
export default function PromptInput({ value, onChange, onSubmit, loading }) {
  /** Handle textarea keyboard shortcut: Ctrl/Cmd + Enter to submit */
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!loading && value.trim()) onSubmit();
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="trip-prompt" className="prompt-label">
        Describe your trip
      </label>

      <div className="prompt-textarea-wrap">
        <textarea
          id="trip-prompt"
          className="prompt-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Plan a 3-day trip to Hyderabad focused on food, culture, and sightseeing..."
          disabled={loading}
          rows={4}
          aria-label="Trip request"
          aria-describedby="prompt-hint"
          autoFocus
        />
      </div>

      <div className="prompt-footer">
        <p id="prompt-hint" className="prompt-hint">
          Tip: mention destination, duration, interests, budget, or any preferences.
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to generate
        </p>

        <button
          id="generate-btn"
          type="submit"
          className="btn btn-primary"
          disabled={loading || !value.trim()}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span aria-hidden="true">✦</span>
              Generating…
            </>
          ) : (
            <>
              <span aria-hidden="true">✦</span>
              Generate Itinerary
            </>
          )}
        </button>
      </div>
    </form>
  );
}
