const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { itinerarySchema, buildPrompt } = require('../gemini');

// ---------------------------------------------------------------------------
// Gemini client & model configuration
// ---------------------------------------------------------------------------
const GEMINI_TIMEOUT_MS = 30_000; // 30 seconds
const GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * Creates a configured Gemini client.
 * Throws a structured error if the API key is missing.
 */
function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    const err = new Error('GEMINI_API_KEY is not configured.');
    err.code = 'LLM_CONFIGURATION_ERROR';
    throw err;
  }
  return new GoogleGenAI({ apiKey });
}

// ---------------------------------------------------------------------------
// POST /generate
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  // 1. Input validation
  const { input } = req.body || {};

  if (input === undefined || input === null) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Trip request must be a non-empty string.',
      },
    });
  }

  if (typeof input !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Trip request must be a non-empty string.',
      },
    });
  }

  if (input.trim() === '') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Trip request must be a non-empty string.',
      },
    });
  }

  // 2. Create Gemini client (validates API key)
  let ai;
  try {
    ai = createGeminiClient();
  } catch (err) {
    console.error('[generate] LLM configuration error:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'LLM_CONFIGURATION_ERROR',
        message: 'The server is not properly configured to call the AI service.',
      },
    });
  }

  // 3. Call Gemini with a timeout
  let response;
  try {
    const prompt = buildPrompt(input.trim());

    // Race the Gemini call against a timeout promise
    const geminiCall = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        temperature: 0.7,
      },
    });

    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error('Gemini request timed out.');
        err.code = 'LLM_TIMEOUT';
        reject(err);
      }, GEMINI_TIMEOUT_MS);
    });

    response = await Promise.race([geminiCall, timeout]);
  } catch (err) {
    if (err.code === 'LLM_TIMEOUT') {
      console.error('[generate] Gemini request timed out after', GEMINI_TIMEOUT_MS, 'ms');
      return res.status(504).json({
        success: false,
        error: {
          code: 'LLM_TIMEOUT',
          message: 'The AI service took too long to respond. Please try again.',
        },
      });
    }

    // Treat auth/quota errors specially when detectable
    const message = err.message || '';
    if (
      message.toLowerCase().includes('api key') ||
      message.toLowerCase().includes('authentication') ||
      message.toLowerCase().includes('permission') ||
      message.toLowerCase().includes('403')
    ) {
      console.error('[generate] Gemini auth/config error:', message);
      return res.status(500).json({
        success: false,
        error: {
          code: 'LLM_CONFIGURATION_ERROR',
          message: 'The server is not properly configured to call the AI service.',
        },
      });
    }

    console.error('[generate] Gemini API error:', message);
    return res.status(502).json({
      success: false,
      error: {
        code: 'LLM_REQUEST_FAILED',
        message: 'Failed to reach the AI service. Please try again.',
      },
    });
  }

  // 4. Extract and validate the structured response
  let itinerary;
  try {
    const text = response?.text;
    if (!text || text.trim() === '') {
      throw new Error('Empty response text from Gemini.');
    }
    // The SDK returns the JSON as a string even with responseSchema — parse it.
    itinerary = JSON.parse(text);
  } catch (err) {
    console.error('[generate] Could not extract itinerary from Gemini response:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'EMPTY_LLM_RESPONSE',
        message: 'The AI service returned an unusable response. Please try again.',
      },
    });
  }

  // 5. Sanity-check: ensure the essential top-level fields are present
  if (!itinerary.trip || !Array.isArray(itinerary.days)) {
    console.error('[generate] Itinerary is missing required fields:', JSON.stringify(itinerary).slice(0, 200));
    return res.status(500).json({
      success: false,
      error: {
        code: 'EMPTY_LLM_RESPONSE',
        message: 'The AI service returned an incomplete itinerary. Please try again.',
      },
    });
  }

  // 6. Return the successful response
  return res.status(200).json({
    success: true,
    data: itinerary,
  });
});

module.exports = router;
