/**
 * result.js — JSDoc type definitions for the Trip Planner data contract.
 *
 * These types document the shape of data flowing from the backend through
 * api.js into React state and components. They are used as JSDoc @typedef
 * annotations — no runtime cost, pure documentation + editor IntelliSense.
 *
 * The contract must match the backend exactly. Do NOT rename fields here.
 */

/**
 * @typedef {Object} TripMeta
 * @property {string} destination  - Name of the destination
 * @property {number} durationDays - Total number of days (integer)
 * @property {string} summary      - One-paragraph overview of the trip
 */

/**
 * @typedef {'sightseeing'|'food'|'culture'|'shopping'|'nature'|'relaxation'|'activity'} StopType
 */

/**
 * @typedef {'early-morning'|'morning'|'afternoon'|'evening'|'night'} BestTime
 */

/**
 * @typedef {Object} Stop
 * @property {string}   id              - Unique stop identifier (from backend)
 * @property {string}   name            - Name of the place or activity
 * @property {StopType} type            - Category of the stop
 * @property {string}   description     - Description of the stop
 * @property {number}   durationMinutes - Duration in minutes (integer)
 * @property {BestTime} bestTime        - Best time of day to visit
 */

/**
 * @typedef {Object} Day
 * @property {number} dayNumber - Sequential day number starting from 1
 * @property {string} title     - Short title for the day
 * @property {string} summary   - Overview of the day's theme
 * @property {Stop[]} stops     - Ordered list of stops for this day
 */

/**
 * @typedef {Object} TripData
 * @property {TripMeta} trip - Trip-level metadata
 * @property {Day[]}    days - Array of day objects
 */

// This file exports no runtime values — types are JSDoc only.
export {};
