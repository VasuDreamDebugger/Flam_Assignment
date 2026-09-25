import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Automatically clean up rendered components after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  // Ensure fetch mock is fresh
  vi.restoreAllMocks();
  localStorage.clear();
});
