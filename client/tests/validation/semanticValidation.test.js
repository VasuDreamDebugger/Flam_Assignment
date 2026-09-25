import { describe, it, expect } from 'vitest';
import { validateTrip } from '../../src/lib/validateTrip';
import { validItinerary, createValidItinerary } from '../fixtures/itinerary';
import * as invalid from '../fixtures/invalidItineraries';

describe('validateTrip — Semantic & Custom Domain Validation Rules', () => {
  describe('Cross-Field: Duration and Day Count Alignment', () => {
    it('accepts when trip.durationDays === days.length', () => {
      const result = validateTrip(validItinerary);
      expect(result.valid).toBe(true);
    });

    it('rejects when durationDays (3) > days.length (2)', () => {
      const result = validateTrip(invalid.durationDaysMismatchLess);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('does not match trip durationDays');
    });

    it('rejects when durationDays (1) < days.length (2)', () => {
      const result = validateTrip(invalid.durationDaysMismatchMore);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('does not match trip durationDays');
    });
  });

  describe('Cross-Field: Sequential Day Numbers', () => {
    it('accepts properly 1-indexed contiguous dayNumbers [1, 2]', () => {
      const result = validateTrip(validItinerary);
      expect(result.valid).toBe(true);
    });

    it('rejects skipped day numbers [1, 3]', () => {
      const result = validateTrip(invalid.nonSequentialDays);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expected 2');
    });

    it('rejects duplicate day numbers [1, 1]', () => {
      const result = validateTrip(invalid.duplicateDayNumbers);
      expect(result.valid).toBe(false);
    });
  });

  describe('Stop ID Global Uniqueness', () => {
    it('rejects duplicate stop IDs within the same day', () => {
      const result = validateTrip(invalid.duplicateStopIdSameDay);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate stop ID');
    });

    it('rejects duplicate stop IDs across different days', () => {
      const result = validateTrip(invalid.duplicateStopIdAcrossDays);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate stop ID');
    });
  });

  describe('Placeholder Detection', () => {
    it('rejects placeholder destination "string"', () => {
      const result = validateTrip(invalid.placeholderDestination);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Trip destination contains placeholder content');
    });

    it('rejects placeholder destination "unknown"', () => {
      const result = validateTrip(invalid.unknownDestination);
      expect(result.valid).toBe(false);
    });

    it('rejects placeholder destination "N/A"', () => {
      const result = validateTrip(invalid.naDestination);
      expect(result.valid).toBe(false);
    });

    it('rejects placeholder destination "example destination"', () => {
      const item = createValidItinerary();
      item.trip.destination = 'example destination';
      expect(validateTrip(item).valid).toBe(false);
    });

    it('rejects placeholder trip summary with "Lorem ipsum"', () => {
      const result = validateTrip(invalid.placeholderSummary);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Trip summary contains placeholder content');
    });

    it('rejects placeholder day title "test"', () => {
      const result = validateTrip(invalid.placeholderDayTitle);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('title contains placeholder content');
    });

    it('rejects placeholder stop name "some place"', () => {
      const result = validateTrip(invalid.placeholderStopName);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Stop name contains placeholder content');
    });

    it('rejects placeholder stop description', () => {
      const result = validateTrip(invalid.placeholderStopDescription);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Stop description contains placeholder content');
    });

    it('rejects generic meaningless day (Title: "Day 1", Summary: "Explore the city")', () => {
      const result = validateTrip(invalid.genericDayTitleAndSummary);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('generic placeholder title and summary');
    });
  });

  describe('Duplicate Stop Content Prevention', () => {
    it('rejects duplicate identical stop names across the itinerary', () => {
      const result = validateTrip(invalid.duplicateStopNamesAcrossDays);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate stop name "Charminar"');
    });

    it('rejects duplicate copy-pasted stop descriptions across different stops', () => {
      const result = validateTrip(invalid.duplicateStopDescriptions);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate identical stop description');
    });
  });

  describe('Contradictory Stop Types & Unsupported Precision', () => {
    it('rejects obvious category contradictions (e.g. Pizza restaurant as nature)', () => {
      const result = validateTrip(invalid.contradictoryStopType);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('contradictory type');
    });

    it('rejects claims of unsupported live precision in summary', () => {
      const result = validateTrip(invalid.unsupportedPrecisionSummary);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('unsupported real-time precision claim');
    });

    it('rejects claims of unsupported live precision in stop description', () => {
      const result = validateTrip(invalid.unsupportedPrecisionInStop);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('unsupported real-time precision claim');
    });
  });
});
