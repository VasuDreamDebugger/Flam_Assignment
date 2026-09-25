/**
 * tests/fixtures/itinerary.js — Reusable valid itinerary fixtures and factory helpers.
 */

export const validItinerary = {
  trip: {
    destination: 'Hyderabad',
    durationDays: 2,
    summary: 'A 2-day deep dive into the royal history and legendary culinary heritage of Hyderabad.',
  },
  days: [
    {
      dayNumber: 1,
      title: 'Historic Landmarks and Palaces',
      summary: 'Explore the iconic monuments and heritage landmarks of Old Hyderabad.',
      stops: [
        {
          id: 'hyd-d1-s1',
          name: 'Charminar',
          type: 'culture',
          description: 'The monumental 16th-century mosque and landmark at the heart of the city.',
          durationMinutes: 90,
          bestTime: 'morning',
        },
        {
          id: 'hyd-d1-s2',
          name: 'Chowmahalla Palace',
          type: 'sightseeing',
          description: 'Opulent 18th-century palace complex of the Nizams featuring grand courtyards and vintage cars.',
          durationMinutes: 120,
          bestTime: 'afternoon',
        },
      ],
    },
    {
      dayNumber: 2,
      title: 'Bazaars and Hyderabadi Cuisine',
      summary: 'Experience traditional shopping and authentic Hyderabadi biryani.',
      stops: [
        {
          id: 'hyd-d2-s1',
          name: 'Laad Bazaar',
          type: 'shopping',
          description: 'Vibrant historic market known for traditional lacquer bangles, pearls, and artisan crafts.',
          durationMinutes: 90,
          bestTime: 'evening',
        },
      ],
    },
  ],
};

export const valid3DayItinerary = {
  trip: {
    destination: 'Kyoto',
    durationDays: 3,
    summary: 'A peaceful three-day exploration of ancient temples, bamboo groves, and traditional tea culture in Kyoto.',
  },
  days: [
    {
      dayNumber: 1,
      title: 'Eastern Kyoto Temples',
      summary: 'Visit ancient UNESCO world heritage temples in the historic Higashiyama district.',
      stops: [
        {
          id: 'kyo-d1-s1',
          name: 'Kiyomizu-dera',
          type: 'culture',
          description: 'Iconic wooden Buddhist temple with panoramic views of Kyoto.',
          durationMinutes: 120,
          bestTime: 'early-morning',
        },
        {
          id: 'kyo-d1-s2',
          name: 'Gion District Walk',
          type: 'culture',
          description: 'Stroll through traditional geisha district with historic wooden machiya houses.',
          durationMinutes: 90,
          bestTime: 'evening',
        },
      ],
    },
    {
      dayNumber: 2,
      title: 'Arashiyama Bamboo and Nature',
      summary: 'Immerse in western Kyoto scenic bamboo groves and river vistas.',
      stops: [
        {
          id: 'kyo-d2-s1',
          name: 'Arashiyama Bamboo Grove',
          type: 'nature',
          description: 'Walk through soaring green bamboo stalks in the serene Arashiyama forest.',
          durationMinutes: 75,
          bestTime: 'morning',
        },
        {
          id: 'kyo-d2-s2',
          name: 'Tenryu-ji Zen Garden',
          type: 'relaxation',
          description: 'World Heritage Zen temple featuring a landscape garden from the 14th century.',
          durationMinutes: 90,
          bestTime: 'afternoon',
        },
      ],
    },
    {
      dayNumber: 3,
      title: 'Shrines and Market Food',
      summary: 'Explore thousands of vermilion torii gates and sample local market delights.',
      stops: [
        {
          id: 'kyo-d3-s1',
          name: 'Fushimi Inari Taisha',
          type: 'activity',
          description: 'Famous shrine trail with thousands of vibrant vermilion torii gates winding up Mount Inari.',
          durationMinutes: 150,
          bestTime: 'early-morning',
        },
        {
          id: 'kyo-d3-s2',
          name: 'Nishiki Market Food Walk',
          type: 'food',
          description: 'Narrow five-block shopping street packed with over a hundred food stalls and eateries.',
          durationMinutes: 90,
          bestTime: 'afternoon',
        },
      ],
    },
  ],
};

export const validSingleDayItinerary = {
  trip: {
    destination: 'Paris',
    durationDays: 1,
    summary: 'A curated one-day journey through Parisian art, architectural icons, and world-class café culture.',
  },
  days: [
    {
      dayNumber: 1,
      title: 'Paris Highlights',
      summary: 'Experience the essential Parisian landmarks in a single memorable day.',
      stops: [
        {
          id: 'par-d1-s1',
          name: 'Louvre Museum',
          type: 'culture',
          description: 'World-famous art museum housing thousands of historic masterpieces.',
          durationMinutes: 180,
          bestTime: 'morning',
        },
        {
          id: 'par-d1-s2',
          name: 'Eiffel Tower at Twilight',
          type: 'sightseeing',
          description: 'Admire the landmark iron lattice tower as the Parisian lights begin to sparkle.',
          durationMinutes: 90,
          bestTime: 'evening',
        },
      ],
    },
  ],
};

/**
 * Creates a cloned valid itinerary with custom overrides.
 * @param {object} overrides
 * @returns {object}
 */
export function createValidItinerary(overrides = {}) {
  const base = JSON.parse(JSON.stringify(validItinerary));
  return {
    ...base,
    ...overrides,
    trip: {
      ...base.trip,
      ...(overrides.trip || {}),
    },
    days: overrides.days || base.days,
  };
}

/**
 * Creates a valid Stop object with custom overrides.
 * @param {object} overrides
 * @returns {object}
 */
export function createValidStop(overrides = {}) {
  return {
    id: 'test-stop-1',
    name: 'Golconda Fort',
    type: 'culture',
    description: 'Ancient fortress complex with ingenious acoustics and historic palaces.',
    durationMinutes: 120,
    bestTime: 'morning',
    ...overrides,
  };
}

/**
 * Creates a valid Day object with custom overrides.
 * @param {object} overrides
 * @returns {object}
 */
export function createValidDay(overrides = {}) {
  return {
    dayNumber: 1,
    title: 'Fortress and Heritage',
    summary: 'Explore the royal fortress and acoustic architecture.',
    stops: [createValidStop()],
    ...overrides,
  };
}
