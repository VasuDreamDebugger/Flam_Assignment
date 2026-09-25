import { describe, it, expect } from 'vitest';
import {
  validateTrip,
  tripSchema,
  tripInfoSchema,
  daySchema,
  stopSchema,
  ALLOWED_STOP_TYPES,
  ALLOWED_BEST_TIMES,
} from '../../src/lib/validateTrip';
import { validItinerary, valid3DayItinerary, validSingleDayItinerary, createValidItinerary } from '../fixtures/itinerary';
import * as invalid from '../fixtures/invalidItineraries';

describe('validateTrip — Structural & Data-Contract Validation', () => {
  describe('Root Structure', () => {
    it('accepts a valid 2-day itinerary', () => {
      const result = validateTrip(validItinerary);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validItinerary);
    });

    it('accepts a valid 3-day itinerary', () => {
      const result = validateTrip(valid3DayItinerary);
      expect(result.valid).toBe(true);
    });

    it('accepts a valid 1-day itinerary', () => {
      const result = validateTrip(validSingleDayItinerary);
      expect(result.valid).toBe(true);
    });

    it('rejects null', () => {
      const result = validateTrip(invalid.nullPayload);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Failed structural schema validation.');
    });

    it('rejects undefined', () => {
      const result = validateTrip(invalid.undefinedPayload);
      expect(result.valid).toBe(false);
    });

    it('rejects arrays as root', () => {
      const result = validateTrip(invalid.arrayPayload);
      expect(result.valid).toBe(false);
    });

    it('rejects primitives (string, number, boolean)', () => {
      expect(validateTrip('string').valid).toBe(false);
      expect(validateTrip(42).valid).toBe(false);
      expect(validateTrip(true).valid).toBe(false);
    });

    it('rejects empty object', () => {
      const result = validateTrip(invalid.emptyObjectPayload);
      expect(result.valid).toBe(false);
    });

    it('rejects missing trip object', () => {
      const result = validateTrip(invalid.missingTripPayload);
      expect(result.valid).toBe(false);
    });

    it('rejects missing days array', () => {
      const result = validateTrip(invalid.missingDaysPayload);
      expect(result.valid).toBe(false);
    });

    it('rejects additional unknown root fields under strict schema policy', () => {
      const result = validateTrip(invalid.extraRootFieldPayload);
      expect(result.valid).toBe(false);
    });
  });

  describe('Trip Metadata Contract', () => {
    it('validates tripInfoSchema in isolation', () => {
      expect(tripInfoSchema.safeParse(validItinerary.trip).success).toBe(true);
    });

    it('rejects empty destination string', () => {
      const result = validateTrip(invalid.emptyDestination);
      expect(result.valid).toBe(false);
    });

    it('rejects whitespace-only destination', () => {
      const result = validateTrip(invalid.whitespaceDestination);
      expect(result.valid).toBe(false);
    });

    it('rejects non-string destination', () => {
      const result = validateTrip(invalid.nonStringDestination);
      expect(result.valid).toBe(false);
    });

    it('rejects destination exceeding 100 characters', () => {
      const result = validateTrip(invalid.longDestination);
      expect(result.valid).toBe(false);
    });

    it('rejects zero durationDays', () => {
      const result = validateTrip(invalid.zeroDurationDays);
      expect(result.valid).toBe(false);
    });

    it('rejects negative durationDays', () => {
      const result = validateTrip(invalid.negativeDurationDays);
      expect(result.valid).toBe(false);
    });

    it('rejects floating-point durationDays', () => {
      const result = validateTrip(invalid.floatDurationDays);
      expect(result.valid).toBe(false);
    });

    it('rejects string durationDays ("2")', () => {
      const result = validateTrip(invalid.stringDurationDays);
      expect(result.valid).toBe(false);
    });

    it('rejects durationDays > 30', () => {
      const result = validateTrip(invalid.excessiveDurationDays);
      expect(result.valid).toBe(false);
    });

    it('rejects empty trip summary', () => {
      const result = validateTrip(invalid.emptySummary);
      expect(result.valid).toBe(false);
    });

    it('rejects whitespace-only trip summary', () => {
      const result = validateTrip(invalid.whitespaceSummary);
      expect(result.valid).toBe(false);
    });
  });

  describe('Day Contract', () => {
    it('validates daySchema in isolation', () => {
      expect(daySchema.safeParse(validItinerary.days[0]).success).toBe(true);
    });

    it('rejects missing dayNumber', () => {
      const badDay = createValidItinerary();
      delete badDay.days[0].dayNumber;
      expect(validateTrip(badDay).valid).toBe(false);
    });

    it('rejects float dayNumber', () => {
      const badDay = createValidItinerary();
      badDay.days[0].dayNumber = 1.5;
      expect(validateTrip(badDay).valid).toBe(false);
    });

    it('rejects dayNumber = 0', () => {
      const result = validateTrip(invalid.dayStartingAtZero);
      expect(result.valid).toBe(false);
    });

    it('rejects dayNumber > 30', () => {
      const badDay = createValidItinerary();
      badDay.days[0].dayNumber = 35;
      expect(validateTrip(badDay).valid).toBe(false);
    });

    it('rejects missing day title', () => {
      const result = validateTrip(invalid.missingDayTitle);
      expect(result.valid).toBe(false);
    });

    it('rejects empty day title', () => {
      const result = validateTrip(invalid.emptyDayTitle);
      expect(result.valid).toBe(false);
    });

    it('rejects empty stops array in a day', () => {
      const result = validateTrip(invalid.emptyDayStops);
      expect(result.valid).toBe(false);
    });

    it('rejects more than 8 stops in a day', () => {
      const result = validateTrip(invalid.excessiveDayStops);
      expect(result.valid).toBe(false);
    });

    it('rejects empty days array (0 days in itinerary)', () => {
      const result = validateTrip(invalid.emptyDaysArray);
      expect(result.valid).toBe(false);
    });
  });

  describe('Stop Contract & Enums', () => {
    it('validates stopSchema in isolation', () => {
      expect(stopSchema.safeParse(validItinerary.days[0].stops[0]).success).toBe(true);
    });

    it('rejects missing stop id', () => {
      const result = validateTrip(invalid.missingStopId);
      expect(result.valid).toBe(false);
    });

    it('rejects empty stop id', () => {
      const result = validateTrip(invalid.emptyStopId);
      expect(result.valid).toBe(false);
    });

    it('rejects missing stop name', () => {
      const result = validateTrip(invalid.missingStopName);
      expect(result.valid).toBe(false);
    });

    it('rejects empty stop name', () => {
      const result = validateTrip(invalid.emptyStopName);
      expect(result.valid).toBe(false);
    });

    it('accepts all 7 valid stop types', () => {
      for (const type of ALLOWED_STOP_TYPES) {
        const item = createValidItinerary();
        item.days[0].stops[0].type = type;
        expect(validateTrip(item).valid).toBe(true);
      }
    });

    it('rejects invalid stop types (hotel, random, unknown)', () => {
      expect(validateTrip(invalid.invalidStopType).valid).toBe(false);

      const badType1 = createValidItinerary();
      badType1.days[0].stops[0].type = 'random';
      expect(validateTrip(badType1).valid).toBe(false);

      const badType2 = createValidItinerary();
      badType2.days[0].stops[0].type = 'unknown';
      expect(validateTrip(badType2).valid).toBe(false);
    });

    it('rejects missing stop description', () => {
      const result = validateTrip(invalid.missingStopDescription);
      expect(result.valid).toBe(false);
    });

    it('rejects whitespace stop description', () => {
      const result = validateTrip(invalid.emptyStopDescription);
      expect(result.valid).toBe(false);
    });

    it('rejects stop durationMinutes = 0', () => {
      const result = validateTrip(invalid.zeroDurationMinutes);
      expect(result.valid).toBe(false);
    });

    it('rejects negative stop durationMinutes', () => {
      const result = validateTrip(invalid.negativeDurationMinutes);
      expect(result.valid).toBe(false);
    });

    it('rejects decimal stop durationMinutes', () => {
      const result = validateTrip(invalid.floatDurationMinutes);
      expect(result.valid).toBe(false);
    });

    it('rejects string stop durationMinutes', () => {
      const result = validateTrip(invalid.stringDurationMinutes);
      expect(result.valid).toBe(false);
    });

    it('rejects stop durationMinutes > 1440 (24h)', () => {
      const result = validateTrip(invalid.excessiveDurationMinutes);
      expect(result.valid).toBe(false);
    });

    it('accepts all 5 valid bestTime enums', () => {
      for (const bestTime of ALLOWED_BEST_TIMES) {
        const item = createValidItinerary();
        item.days[0].stops[0].bestTime = bestTime;
        expect(validateTrip(item).valid).toBe(true);
      }
    });

    it('rejects invalid bestTime enums (midnight, noon, anytime)', () => {
      expect(validateTrip(invalid.invalidBestTime).valid).toBe(false);

      const badTime1 = createValidItinerary();
      badTime1.days[0].stops[0].bestTime = 'noon';
      expect(validateTrip(badTime1).valid).toBe(false);

      const badTime2 = createValidItinerary();
      badTime2.days[0].stops[0].bestTime = 'anytime';
      expect(validateTrip(badTime2).valid).toBe(false);
    });
  });
});
