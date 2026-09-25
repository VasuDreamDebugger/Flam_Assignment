import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import * as invalid from '../fixtures/invalidItineraries';

describe('App Integration — Invalid AI Responses NEVER Reach Rendered State', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function runFlowWithPayload(payload, httpOk = true, rawBody = null) {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: httpOk,
      status: httpOk ? 200 : 400,
      json: async () => rawBody || { success: true, data: payload },
    });

    render(<App />);

    const textarea = screen.getByRole('textbox', { name: /Trip request/i });
    await user.type(textarea, 'Test trip request');

    const submitBtn = screen.getByRole('button', { name: /Generate Itinerary/i });
    await user.click(submitBtn);

    // Wait for the error banner to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // CRITICAL ASSERTION: The itinerary container MUST NOT exist
    expect(screen.queryByLabelText(/Trip itinerary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TRIP OVERVIEW/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Day-by-day plan/i)).not.toBeInTheDocument();
  }

  it('1. Rejects wrong root shape (array response)', async () => {
    await runFlowWithPayload(invalid.arrayPayload);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('2. Rejects empty object payload', async () => {
    await runFlowWithPayload(invalid.emptyObjectPayload);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('3. Rejects payload with missing trip object', async () => {
    await runFlowWithPayload(invalid.missingTripPayload);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('4. Rejects payload with missing days array', async () => {
    await runFlowWithPayload(invalid.missingDaysPayload);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('5. Rejects invalid durationDays = 0', async () => {
    await runFlowWithPayload(invalid.zeroDurationDays);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('6. Rejects durationDays mismatch (duration = 3, days.length = 2)', async () => {
    await runFlowWithPayload(invalid.durationDaysMismatchLess);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('7. Rejects non-sequential skipped day numbers [1, 3]', async () => {
    await runFlowWithPayload(invalid.nonSequentialDays);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('8. Rejects day with empty stops array', async () => {
    await runFlowWithPayload(invalid.emptyDayStops);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('9. Rejects invalid stop type ("hotel")', async () => {
    await runFlowWithPayload(invalid.invalidStopType);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('10. Rejects invalid stop durationMinutes = 0', async () => {
    await runFlowWithPayload(invalid.zeroDurationMinutes);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('11. Rejects invalid bestTime enum ("midnight")', async () => {
    await runFlowWithPayload(invalid.invalidBestTime);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('12. Rejects duplicate stop IDs across days', async () => {
    await runFlowWithPayload(invalid.duplicateStopIdAcrossDays);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('13. Rejects placeholder destination ("string")', async () => {
    await runFlowWithPayload(invalid.placeholderDestination);
    expect(screen.getByText(/We received an invalid itinerary/i)).toBeInTheDocument();
  });

  it('14. Rejects empty server response (data: null)', async () => {
    await runFlowWithPayload(null, true, { success: true, data: null });
    expect(screen.getByText(/The AI returned an empty response/i)).toBeInTheDocument();
  });
});
