import { z } from 'zod';

/**
 * Non-empty, non-whitespace string schema with maximum length constraint.
 * Does NOT trim or transform the input; verifies that after trimming length > 0.
 *
 * @param {number} maxLength - Maximum allowed string length.
 * @param {string} fieldName - Descriptive name for error messages.
 */
const nonWhitespaceString = (maxLength, fieldName) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .min(1, `${fieldName} cannot be empty`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .refine((val) => val.trim().length > 0, {
      message: `${fieldName} cannot be whitespace only`,
    });

/** Allowed stop type enums matching the itinerary contract */
export const ALLOWED_STOP_TYPES = [
  'sightseeing',
  'food',
  'culture',
  'shopping',
  'nature',
  'relaxation',
  'activity',
];

/** Allowed best time enums matching the itinerary contract */
export const ALLOWED_BEST_TIMES = [
  'early-morning',
  'morning',
  'afternoon',
  'evening',
  'night',
];

/**
 * Stop Schema
 * Enforces the contract for an individual stop within a day.
 */
export const stopSchema = z
  .object({
    id: nonWhitespaceString(100, 'Stop id'),
    name: nonWhitespaceString(150, 'Stop name'),
    type: z.enum(ALLOWED_STOP_TYPES, {
      errorMap: () => ({ message: 'Invalid stop type' }),
    }),
    description: nonWhitespaceString(500, 'Stop description'),
    durationMinutes: z
      .number({
        required_error: 'Stop durationMinutes is required',
        invalid_type_error: 'Stop durationMinutes must be a number',
      })
      .int('Stop durationMinutes must be an integer')
      .min(1, 'Stop durationMinutes must be greater than 0')
      .max(1440, 'Stop durationMinutes cannot exceed 1440 minutes (24 hours)'),
    bestTime: z.enum(ALLOWED_BEST_TIMES, {
      errorMap: () => ({ message: 'Invalid bestTime' }),
    }),
  })
  .strict();

/**
 * Day Schema
 * Enforces the contract for a single day in the itinerary.
 */
export const daySchema = z
  .object({
    dayNumber: z
      .number({
        required_error: 'Day dayNumber is required',
        invalid_type_error: 'Day dayNumber must be a number',
      })
      .int('Day dayNumber must be an integer')
      .min(1, 'Day dayNumber must be at least 1')
      .max(30, 'Day dayNumber cannot exceed 30'),
    title: nonWhitespaceString(100, 'Day title'),
    summary: nonWhitespaceString(300, 'Day summary'),
    stops: z
      .array(stopSchema, {
        required_error: 'Day stops are required',
        invalid_type_error: 'Day stops must be an array',
      })
      .min(1, 'Each day must have at least 1 stop')
      .max(8, 'Each day cannot have more than 8 stops'),
  })
  .strict();

/**
 * Trip Meta Schema
 * Enforces trip-level destination, duration, and summary.
 */
export const tripInfoSchema = z
  .object({
    destination: nonWhitespaceString(100, 'Trip destination'),
    durationDays: z
      .number({
        required_error: 'Trip durationDays is required',
        invalid_type_error: 'Trip durationDays must be a number',
      })
      .int('Trip durationDays must be an integer')
      .min(1, 'Trip durationDays must be at least 1')
      .max(30, 'Trip durationDays cannot exceed 30'),
    summary: nonWhitespaceString(500, 'Trip summary'),
  })
  .strict();

/**
 * Root Itinerary Schema
 * Enforces the complete top-level trip contract.
 */
export const tripSchema = z
  .object({
    trip: tripInfoSchema,
    days: z
      .array(daySchema, {
        required_error: 'Days array is required',
        invalid_type_error: 'Days must be an array',
      })
      .min(1, 'Itinerary must include at least 1 day'),
  })
  .strict();

/** Obvious placeholder terms (checked case-insensitively against whole string or as prefixes) */
const PLACEHOLDER_TERMS = new Set([
  'string',
  'example',
  'test',
  'todo',
  'unknown',
  'n/a',
  'na',
  'null',
  'undefined',
  'some place',
  'some restaurant',
  'random place',
  'test stop',
  'example location',
  'example destination',
  'placeholder',
  'tbd',
  'none',
  'asdf',
  'foo',
  'bar',
]);

const PLACEHOLDER_PREFIXES = [
  'example ',
  'test ',
  'some place',
  'random place',
  'test stop',
  'stop 1',
  'stop 2',
  'stop 3',
  'place 1',
  'place 2',
];

/**
 * Checks whether a text string contains obvious placeholder content.
 *
 * @param {string} text - Text to inspect.
 * @returns {boolean} True if text appears to be placeholder content.
 */
function isPlaceholderText(text) {
  if (typeof text !== 'string') return false;
  const normalized = text.trim().toLowerCase();

  if (PLACEHOLDER_TERMS.has(normalized)) return true;
  if (normalized.includes('lorem ipsum')) return true;

  for (const prefix of PLACEHOLDER_PREFIXES) {
    if (normalized.startsWith(prefix) && normalized.length < 30) {
      return true;
    }
  }

  return false;
}

/**
 * Detects claims of unsupported real-time precision.
 *
 * @param {string} text
 * @returns {boolean}
 */
function hasUnsupportedPrecision(text) {
  if (typeof text !== 'string') return false;
  const lower = text.toLowerCase();

  if (
    (lower.includes('open from') && lower.includes('today')) ||
    (lower.includes('currently has') && lower.includes('tickets')) ||
    lower.includes('entry fee is exactly') ||
    lower.includes('real-time traffic') ||
    lower.includes('live weather condition')
  ) {
    return true;
  }
  return false;
}

/**
 * Checks for obvious semantic contradictions between stop name and type.
 * Conservative: only flags obvious mismatches.
 *
 * @param {string} name
 * @param {string} type
 * @returns {boolean} True if contradictory.
 */
function isStopTypeContradictory(name, type) {
  const lower = name.toLowerCase();

  const isFoodPlace =
    lower.includes('pizzeria') ||
    lower.includes('pizza restaurant') ||
    lower.includes('burger joint') ||
    lower.includes('diner') ||
    lower.includes('food truck');

  if (isFoodPlace && (type === 'nature' || type === 'shopping')) {
    return true;
  }

  return false;
}

/**
 * Performs custom cross-field, content-quality, and semantic validation
 * on a Zod-validated itinerary.
 *
 * @param {import('../types/result').TripData} itinerary
 * @returns {{ valid: true } | { valid: false, reason: string }}
 */
function validateCustomRules(itinerary) {
  const { trip, days } = itinerary;

  // 1. Cross-field: days count must match trip durationDays
  if (days.length !== trip.durationDays) {
    return {
      valid: false,
      reason: `Days count (${days.length}) does not match trip durationDays (${trip.durationDays}).`,
    };
  }

  // 2. Cross-field: dayNumbers must be sequential starting at 1, and unique
  const seenDayNumbers = new Set();
  for (let i = 0; i < days.length; i++) {
    const expectedDayNum = i + 1;
    const currentDayNum = days[i].dayNumber;

    if (currentDayNum !== expectedDayNum) {
      return {
        valid: false,
        reason: `Day at index ${i} has dayNumber ${currentDayNum}, expected ${expectedDayNum}.`,
      };
    }

    if (seenDayNumbers.has(currentDayNum)) {
      return {
        valid: false,
        reason: `Duplicate dayNumber ${currentDayNum} detected.`,
      };
    }
    seenDayNumbers.add(currentDayNum);
  }

  // 3. Content-quality: trip destination & summary placeholders
  if (isPlaceholderText(trip.destination)) {
    return {
      valid: false,
      reason: `Trip destination contains placeholder content: "${trip.destination}".`,
    };
  }
  if (isPlaceholderText(trip.summary)) {
    return {
      valid: false,
      reason: `Trip summary contains placeholder content: "${trip.summary}".`,
    };
  }
  if (hasUnsupportedPrecision(trip.summary)) {
    return {
      valid: false,
      reason: 'Trip summary contains unsupported real-time precision claim.',
    };
  }

  // 4. Traverse all days and stops: unique stop IDs, unique stop names, unique descriptions
  const seenStopIds = new Set();
  const seenStopNames = new Set();
  const seenStopDescriptions = new Set();

  for (let d = 0; d < days.length; d++) {
    const day = days[d];

    // Day title & summary content quality
    if (isPlaceholderText(day.title)) {
      return {
        valid: false,
        reason: `Day ${day.dayNumber} title contains placeholder content: "${day.title}".`,
      };
    }
    if (isPlaceholderText(day.summary)) {
      return {
        valid: false,
        reason: `Day ${day.dayNumber} summary contains placeholder content: "${day.summary}".`,
      };
    }

    // Meaningless generic day check (e.g. Title: "Day 1" + Summary: "Explore the city")
    const normTitle = day.title.trim().toLowerCase();
    const normSummary = day.summary.trim().toLowerCase();
    const genericTitles = ['day 1', 'day 2', 'day 3', 'day 4', 'day 5', 'day 6', 'day 7'];
    const genericSummaries = [
      'explore the city',
      'things to do',
      'have fun',
      'enjoy your trip',
      'explore',
    ];
    if (genericTitles.includes(normTitle) && genericSummaries.includes(normSummary)) {
      return {
        valid: false,
        reason: `Day ${day.dayNumber} contains generic placeholder title and summary.`,
      };
    }

    for (let s = 0; s < day.stops.length; s++) {
      const stop = day.stops[s];

      // Global stop ID uniqueness
      if (seenStopIds.has(stop.id)) {
        return {
          valid: false,
          reason: `Duplicate stop ID "${stop.id}" detected in itinerary (Day ${day.dayNumber}).`,
        };
      }
      seenStopIds.add(stop.id);

      // Stop name placeholder check
      if (isPlaceholderText(stop.name)) {
        return {
          valid: false,
          reason: `Stop name contains placeholder content: "${stop.name}" (Day ${day.dayNumber}).`,
        };
      }

      // Stop description placeholder check
      if (isPlaceholderText(stop.description)) {
        return {
          valid: false,
          reason: `Stop description contains placeholder content (Day ${day.dayNumber}, stop "${stop.name}").`,
        };
      }

      // Unsupported precision claim in description
      if (hasUnsupportedPrecision(stop.description)) {
        return {
          valid: false,
          reason: `Stop description contains unsupported real-time precision claim (Day ${day.dayNumber}, stop "${stop.name}").`,
        };
      }

      // Duplicate stop name check (normalized)
      const normName = stop.name.trim().toLowerCase();
      if (seenStopNames.has(normName)) {
        return {
          valid: false,
          reason: `Duplicate stop name "${stop.name}" detected across itinerary.`,
        };
      }
      seenStopNames.add(normName);

      // Duplicate description check (exact normalized copy-paste)
      const normDesc = stop.description.trim().toLowerCase();
      if (seenStopDescriptions.has(normDesc)) {
        return {
          valid: false,
          reason: `Duplicate identical stop description detected across itinerary (Stop "${stop.name}").`,
        };
      }
      seenStopDescriptions.add(normDesc);

      // Obvious stop type contradiction check
      if (isStopTypeContradictory(stop.name, stop.type)) {
        return {
          valid: false,
          reason: `Stop "${stop.name}" has contradictory type "${stop.type}".`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates untrusted AI response data against the complete validation pipeline:
 * 1. Zod structural & data-contract schema validation
 * 2. Custom cross-field, content-quality, and semantic rules
 *
 * @param {unknown} data - Untrusted data received from the backend/AI.
 * @returns {{ valid: true, data: import('../types/result').TripData } | { valid: false, error: string, reason?: string, issues?: z.ZodIssue[] }}
 */
export function validateTrip(data) {
  // 1. Zod structural validation
  const zodResult = tripSchema.safeParse(data);
  if (!zodResult.success) {
    return {
      valid: false,
      error: 'Invalid itinerary.',
      reason: 'Failed structural schema validation.',
      issues: zodResult.error.issues,
    };
  }

  // 2. Custom cross-field, content-quality, and semantic validation
  const customResult = validateCustomRules(zodResult.data);
  if (!customResult.valid) {
    return {
      valid: false,
      error: 'Invalid itinerary.',
      reason: customResult.reason,
    };
  }

  return {
    valid: true,
    data: zodResult.data,
  };
}
