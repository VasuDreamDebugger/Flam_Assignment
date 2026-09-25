import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateItinerary, getUserFriendlyError, ApiError } from '../../src/lib/api';
import { validItinerary } from '../fixtures/itinerary';

describe('API Layer — generateItinerary & Error Normalization', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('generateItinerary()', () => {
    it('dispatches a POST request to /generate with correct headers and payload', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: validItinerary,
        }),
      });

      const prompt = 'Plan a 2-day trip to Hyderabad';
      const result = await generateItinerary(prompt);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toMatch(/\/generate$/);
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(options.body)).toEqual({ input: prompt });
      expect(result).toEqual(validItinerary);
    });

    it('throws ApiError with NETWORK_ERROR code when fetch rejects', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(generateItinerary('Paris trip')).rejects.toThrow(ApiError);

      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      try {
        await generateItinerary('Paris trip');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe('NETWORK_ERROR');
        expect(err.status).toBe(0);
        expect(err.message).toContain('Unable to reach the server');
      }
    });

    it('throws ApiError with INVALID_RESPONSE when response body is not JSON', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        },
      });

      await expect(generateItinerary('Paris trip')).rejects.toThrow(ApiError);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        },
      });
      try {
        await generateItinerary('Paris trip');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe('INVALID_RESPONSE');
        expect(err.status).toBe(200);
      }
    });

    it('throws ApiError with backend-provided error code and message on 503 LLM_UNAVAILABLE', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: {
            code: 'LLM_UNAVAILABLE',
            message: 'Gemini is experiencing high demand.',
          },
        }),
      });

      try {
        await generateItinerary('Kyoto trip');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe('LLM_UNAVAILABLE');
        expect(err.status).toBe(503);
        expect(err.message).toBe('Gemini is experiencing high demand.');
      }
    });

    it('throws ApiError on 400 Bad Request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Trip description is required.',
          },
        }),
      });

      try {
        await generateItinerary('');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err.code).toBe('INVALID_INPUT');
        expect(err.status).toBe(400);
      }
    });

    it('throws ApiError on 500 Internal Server Error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Server error.',
          },
        }),
      });

      try {
        await generateItinerary('Goa trip');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err.code).toBe('INTERNAL_SERVER_ERROR');
        expect(err.status).toBe(500);
      }
    });

    it('throws ApiError with EMPTY_RESPONSE when backend returns success with no data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: null,
        }),
      });

      try {
        await generateItinerary('Goa trip');
        expect.unreachable('Should have thrown ApiError');
      } catch (err) {
        expect(err.code).toBe('EMPTY_RESPONSE');
      }
    });
  });

  describe('getUserFriendlyError() mapping', () => {
    it('maps LLM_UNAVAILABLE to user-friendly high traffic message', () => {
      const err = new ApiError('Raw message', 'LLM_UNAVAILABLE', 503);
      const friendly = getUserFriendlyError(err);
      expect(friendly.title).toBe('The AI model is experiencing high traffic');
      expect(friendly.message).toContain('high demand');
    });

    it('maps INVALID_INPUT to prompt guidance', () => {
      const friendly = getUserFriendlyError({ code: 'INVALID_INPUT' });
      expect(friendly.message).toContain('Please enter a trip description');
    });

    it('maps LLM_REQUEST_FAILED to safe retry guidance', () => {
      const friendly = getUserFriendlyError({ code: 'LLM_REQUEST_FAILED' });
      expect(friendly.message).toContain("We couldn't generate your itinerary right now");
    });

    it('maps LLM_CONFIGURATION_ERROR to configuration message', () => {
      const friendly = getUserFriendlyError({ code: 'LLM_CONFIGURATION_ERROR' });
      expect(friendly.message).toContain('The AI service is not configured correctly');
    });

    it('maps EMPTY_LLM_RESPONSE and EMPTY_RESPONSE', () => {
      const friendly1 = getUserFriendlyError({ code: 'EMPTY_LLM_RESPONSE' });
      expect(friendly1.message).toContain('The AI returned an empty response');

      const friendly2 = getUserFriendlyError({ code: 'EMPTY_RESPONSE' });
      expect(friendly2.message).toContain('The AI returned an empty response');
    });

    it('maps INTERNAL_SERVER_ERROR', () => {
      const friendly = getUserFriendlyError({ code: 'INTERNAL_SERVER_ERROR' });
      expect(friendly.message).toContain('Something went wrong on our server');
    });

    it('maps LLM_TIMEOUT', () => {
      const friendly = getUserFriendlyError({ code: 'LLM_TIMEOUT' });
      expect(friendly.message).toContain('took too long to respond');
    });

    it('maps NETWORK_ERROR', () => {
      const friendly = getUserFriendlyError({ code: 'NETWORK_ERROR' });
      expect(friendly.message).toContain('Unable to reach the server');
    });

    it('maps VALIDATION_ERROR and INVALID_ITINERARY_STRUCTURE', () => {
      const friendly1 = getUserFriendlyError({ code: 'VALIDATION_ERROR' });
      expect(friendly1.title).toBe('We received an invalid itinerary');

      const friendly2 = getUserFriendlyError({ code: 'INVALID_ITINERARY_STRUCTURE' });
      expect(friendly2.title).toBe('We received an invalid itinerary');
    });

    it('returns default fallback message for unknown or non-object errors without exposing raw details', () => {
      expect(getUserFriendlyError(null).title).toBe('Something went wrong');
      expect(getUserFriendlyError(undefined).title).toBe('Something went wrong');
      expect(getUserFriendlyError('error string').title).toBe('Something went wrong');
      expect(getUserFriendlyError({ code: 'RANDOM_UNEXPECTED' }).message).toContain("We couldn't generate your itinerary");
    });
  });
});
