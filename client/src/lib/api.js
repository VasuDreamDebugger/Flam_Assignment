/**
 * api.js — All communication with the Trip Planner backend.
 *
 * Responsibilities:
 *   - Send POST /generate with the user's trip request
 *   - Parse HTTP responses
 *   - Throw controlled ApiError instances on failure
 *
 * Does NOT contain React state.
 * Does NOT contain UI logic.
 * Does NOT call Gemini directly.
 */

// ---------------------------------------------------------------------------
// Base URL — configured via VITE_API_BASE_URL env var.
// Falls back to the Vite proxy path (/api) so local development works
// without changing the env file when using `npm run dev`.
// ---------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * A controlled error thrown by api.js so callers can distinguish API
 * failures from unexpected JavaScript errors.
 */
export class ApiError extends Error {
  /**
   * @param {string} message  - User-safe message
   * @param {string} code     - Machine-readable code from backend or client
   * @param {number} status   - HTTP status code (0 = network failure)
   */
  constructor(message, code = 'UNKNOWN_ERROR', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// generateItinerary
// ---------------------------------------------------------------------------

/**
 * Sends the user's free-form trip request to the backend and returns the
 * structured itinerary data on success.
 *
 * @param {string} input - Free-form trip request from the user
 * @returns {Promise<import('../types/result').TripData>} Resolved itinerary data
 * @throws {ApiError} On network failure or a non-successful backend response
 */
export async function generateItinerary(input) {
  let response;

  try {
    response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
  } catch (networkError) {
    // fetch() itself threw — network is unreachable or CORS preflight failed
    throw new ApiError(
      'Unable to reach the server. Please check your connection and try again.',
      'NETWORK_ERROR',
      0
    );
  }

  // Parse JSON regardless of HTTP status so we can read backend error bodies
  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      'The server returned an unreadable response.',
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (!response.ok || body.success === false) {
    // Use the backend's error code/message when available
    const code = body?.error?.code ?? 'REQUEST_FAILED';
    const message =
      body?.error?.message ??
      'Something went wrong. Please try again.';
    throw new ApiError(message, code, response.status);
  }

  if (!body.data) {
    throw new ApiError(
      'The server returned an empty itinerary.',
      'EMPTY_RESPONSE',
      response.status
    );
  }

  return body.data;
}
