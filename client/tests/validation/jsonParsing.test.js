import { describe, it, expect } from 'vitest';
import { validateTrip } from '../../src/lib/validateTrip';
import { validItinerary } from '../fixtures/itinerary';

describe('JSON Parsing & Untrusted Input Boundaries', () => {
  function safeJsonParseAndValidate(rawString) {
    try {
      const parsed = JSON.parse(rawString);
      return validateTrip(parsed);
    } catch (err) {
      return {
        valid: false,
        error: 'JSON parse error',
        reason: err instanceof Error ? err.message : 'Invalid JSON string',
      };
    }
  }

  it('correctly processes a valid serialized JSON itinerary string', () => {
    const jsonStr = JSON.stringify(validItinerary);
    const result = safeJsonParseAndValidate(jsonStr);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validItinerary);
  });

  it('handles malformed incomplete JSON string safely without crashing', () => {
    const malformed = '{"trip": {"destination": "Hyderabad", ';
    const result = safeJsonParseAndValidate(malformed);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('JSON parse error');
  });

  it('handles empty string safely', () => {
    const result = safeJsonParseAndValidate('');
    expect(result.valid).toBe(false);
  });

  it('handles whitespace-only string safely', () => {
    const result = safeJsonParseAndValidate('   \n\t  ');
    expect(result.valid).toBe(false);
  });

  it('handles valid JSON containing a primitive string', () => {
    const result = safeJsonParseAndValidate('"just a string"');
    expect(result.valid).toBe(false);
  });

  it('handles valid JSON containing a primitive number', () => {
    const result = safeJsonParseAndValidate('12345');
    expect(result.valid).toBe(false);
  });

  it('handles valid JSON containing a primitive boolean', () => {
    const result = safeJsonParseAndValidate('true');
    expect(result.valid).toBe(false);
  });

  it('handles valid JSON array with wrong shape', () => {
    const result = safeJsonParseAndValidate('[1, 2, 3]');
    expect(result.valid).toBe(false);
  });

  it('handles valid JSON null literal', () => {
    const result = safeJsonParseAndValidate('null');
    expect(result.valid).toBe(false);
  });
});
