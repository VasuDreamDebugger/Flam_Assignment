const { Type } = require('@google/genai');
const { ALLOWED_STOP_TYPES, ALLOWED_BEST_TIMES } = require('./constants');

/**
 * JSON schema for the trip itinerary. Used by Gemini's structured-output
 * (responseSchema) feature so the model is constrained to return valid JSON
 * matching our contract — no Markdown, no code fences, no prose.
 */
const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    trip: {
      type: Type.OBJECT,
      properties: {
        destination: { type: Type.STRING },
        durationDays: { type: Type.INTEGER },
        summary: { type: Type.STRING },
      },
      required: ['destination', 'durationDays', 'summary'],
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          stops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  enum: ALLOWED_STOP_TYPES,
                },
                description: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
                bestTime: {
                  type: Type.STRING,
                  enum: ALLOWED_BEST_TIMES,
                },
              },
              required: [
                'id',
                'name',
                'type',
                'description',
                'durationMinutes',
                'bestTime',
              ],
            },
          },
        },
        required: ['dayNumber', 'title', 'summary', 'stops'],
      },
    },
  },
  required: ['trip', 'days'],
};

/**
 * Builds the system/user prompt sent to Gemini.
 * The schema enforces structure at the API level; the prompt reinforces
 * constraints the schema cannot express (sequencing, uniqueness, counts).
 *
 * @param {string} userInput - The free-form trip request from the user.
 * @returns {string} The fully constructed prompt string.
 */
function buildPrompt(userInput) {
  return `You are a professional travel itinerary planner.

The user has submitted the following trip request:
"${userInput}"

Generate a complete trip itinerary strictly following this contract:
- "trip": destination (string), durationDays (integer), summary (string).
- "days": an array with exactly one entry per requested day.
  - dayNumber starts at 1 and increments sequentially.
  - Each day has a title, a summary, and between 1 and 8 stops.
  - Each stop has a unique id (e.g. "stop-day1-1"), name, type, description, durationMinutes (integer), and bestTime.
  - Allowed type values: sightseeing, food, culture, shopping, nature, relaxation, activity.
  - Allowed bestTime values: early-morning, morning, afternoon, evening, night.

Rules:
- Respect the user's requested destination, trip duration, interests, dietary restrictions, budget, and any other stated preferences.
- Do NOT invent fields outside the contract.
- Do NOT return Markdown, code fences, or any explanatory text — return pure JSON only.`;
}

module.exports = { itinerarySchema, buildPrompt };
