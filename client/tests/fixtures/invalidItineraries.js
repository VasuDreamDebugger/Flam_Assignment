/**
 * tests/fixtures/invalidItineraries.js — Fixtures for invalid, malformed, and out-of-contract AI payloads.
 */

import { validItinerary } from './itinerary';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 1. Root & Structural Invalid Fixtures
export const nullPayload = null;
export const undefinedPayload = undefined;
export const arrayPayload = [validItinerary];
export const primitivePayload = 'Just a string response from AI';
export const numberPayload = 42;
export const emptyObjectPayload = {};
export const missingTripPayload = { days: clone(validItinerary.days) };
export const missingDaysPayload = { trip: clone(validItinerary.trip) };
export const extraRootFieldPayload = {
  ...clone(validItinerary),
  extraUnexpectedField: 'should be rejected by strict schema',
};

// 2. Trip Level Invalid Fixtures
export const emptyDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = '';
  return i;
})();

export const whitespaceDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = '    \t\n  ';
  return i;
})();

export const nonStringDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = 12345;
  return i;
})();

export const longDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = 'A'.repeat(101);
  return i;
})();

export const placeholderDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = 'string';
  return i;
})();

export const unknownDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = 'unknown';
  return i;
})();

export const naDestination = (() => {
  const i = clone(validItinerary);
  i.trip.destination = 'N/A';
  return i;
})();

export const zeroDurationDays = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = 0;
  return i;
})();

export const negativeDurationDays = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = -2;
  return i;
})();

export const floatDurationDays = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = 2.5;
  return i;
})();

export const stringDurationDays = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = '2';
  return i;
})();

export const excessiveDurationDays = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = 31;
  return i;
})();

export const emptySummary = (() => {
  const i = clone(validItinerary);
  i.trip.summary = '';
  return i;
})();

export const whitespaceSummary = (() => {
  const i = clone(validItinerary);
  i.trip.summary = '   ';
  return i;
})();

export const placeholderSummary = (() => {
  const i = clone(validItinerary);
  i.trip.summary = 'Lorem ipsum dolor sit amet';
  return i;
})();

export const unsupportedPrecisionSummary = (() => {
  const i = clone(validItinerary);
  i.trip.summary = 'Trip with real-time traffic and exact tickets available today.';
  return i;
})();

// 3. Day Level Invalid Fixtures
export const durationDaysMismatchLess = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = 3; // days.length is 2
  return i;
})();

export const durationDaysMismatchMore = (() => {
  const i = clone(validItinerary);
  i.trip.durationDays = 1; // days.length is 2
  return i;
})();

export const nonSequentialDays = (() => {
  const i = clone(validItinerary);
  i.days[0].dayNumber = 1;
  i.days[1].dayNumber = 3; // skipped 2
  return i;
})();

export const duplicateDayNumbers = (() => {
  const i = clone(validItinerary);
  i.days[0].dayNumber = 1;
  i.days[1].dayNumber = 1;
  return i;
})();

export const dayStartingAtZero = (() => {
  const i = clone(validItinerary);
  i.days[0].dayNumber = 0;
  i.days[1].dayNumber = 1;
  return i;
})();

export const emptyDaysArray = (() => {
  const i = clone(validItinerary);
  i.days = [];
  return i;
})();

export const missingDayTitle = (() => {
  const i = clone(validItinerary);
  delete i.days[0].title;
  return i;
})();

export const emptyDayTitle = (() => {
  const i = clone(validItinerary);
  i.days[0].title = '';
  return i;
})();

export const placeholderDayTitle = (() => {
  const i = clone(validItinerary);
  i.days[0].title = 'test';
  return i;
})();

export const genericDayTitleAndSummary = (() => {
  const i = clone(validItinerary);
  i.days[0].title = 'Day 1';
  i.days[0].summary = 'Explore the city';
  return i;
})();

export const emptyDayStops = (() => {
  const i = clone(validItinerary);
  i.days[0].stops = [];
  return i;
})();

export const excessiveDayStops = (() => {
  const i = clone(validItinerary);
  const stops = [];
  for (let s = 1; s <= 9; s++) {
    stops.push({
      id: `stop-${s}`,
      name: `Attraction ${s}`,
      type: 'culture',
      description: `Description of attraction ${s}`,
      durationMinutes: 60,
      bestTime: 'morning',
    });
  }
  i.days[0].stops = stops;
  return i;
})();

// 4. Stop Level Invalid Fixtures
export const missingStopId = (() => {
  const i = clone(validItinerary);
  delete i.days[0].stops[0].id;
  return i;
})();

export const emptyStopId = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].id = '   ';
  return i;
})();

export const duplicateStopIdAcrossDays = (() => {
  const i = clone(validItinerary);
  i.days[1].stops[0].id = i.days[0].stops[0].id; // same id 'hyd-d1-s1'
  return i;
})();

export const duplicateStopIdSameDay = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[1].id = i.days[0].stops[0].id;
  return i;
})();

export const missingStopName = (() => {
  const i = clone(validItinerary);
  delete i.days[0].stops[0].name;
  return i;
})();

export const emptyStopName = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].name = '';
  return i;
})();

export const placeholderStopName = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].name = 'some place';
  return i;
})();

export const duplicateStopNamesAcrossDays = (() => {
  const i = clone(validItinerary);
  i.days[1].stops[0].name = i.days[0].stops[0].name; // both 'Charminar'
  return i;
})();

export const invalidStopType = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].type = 'hotel';
  return i;
})();

export const contradictoryStopType = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].name = 'Authentic Pizza Restaurant';
  i.days[0].stops[0].type = 'nature'; // food place labeled as nature
  return i;
})();

export const missingStopDescription = (() => {
  const i = clone(validItinerary);
  delete i.days[0].stops[0].description;
  return i;
})();

export const emptyStopDescription = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].description = '   ';
  return i;
})();

export const placeholderStopDescription = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].description = 'example description';
  return i;
})();

export const duplicateStopDescriptions = (() => {
  const i = clone(validItinerary);
  i.days[1].stops[0].description = i.days[0].stops[0].description;
  return i;
})();

export const zeroDurationMinutes = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].durationMinutes = 0;
  return i;
})();

export const negativeDurationMinutes = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].durationMinutes = -30;
  return i;
})();

export const floatDurationMinutes = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].durationMinutes = 45.5;
  return i;
})();

export const stringDurationMinutes = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].durationMinutes = '60';
  return i;
})();

export const excessiveDurationMinutes = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].durationMinutes = 1441; // > 24 hours
  return i;
})();

export const invalidBestTime = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].bestTime = 'midnight';
  return i;
})();

export const unsupportedPrecisionInStop = (() => {
  const i = clone(validItinerary);
  i.days[0].stops[0].description =
    'Historic monument where entry fee is exactly 25 rupees and tickets available today.';
  return i;
})();
