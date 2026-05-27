import { describe, expect, it } from "vitest";

import { normalizeTripAdvice } from "@/services/itinerary/trip-advice";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

describe("normalizeTripAdvice", () => {
  it("adds fallback advice when AI omits it", () => {
    const normalized = normalizeTripAdvice(plan());

    expect(normalized.tripAdvice?.bestAreasToStay[0]?.area).toBe("Shinjuku");
    expect(normalized.tripAdvice?.shouldSplitStay).toBe(false);
  });

  it("removes split stay advice for single-city plans", () => {
    const normalized = normalizeTripAdvice({
      ...plan(),
      tripAdvice: {
        bestAreasToStay: [{ area: "Shinjuku", reason: "Transit access." }],
        shouldSplitStay: true,
        splitStayAdvice: {
          summary: "Move hotels.",
          suggestedMoves: [
            { fromDay: 2, toDay: 3, area: "Ginza", reason: "Closer." },
          ],
        },
      },
    });

    expect(normalized.tripAdvice?.shouldSplitStay).toBe(false);
    expect(normalized.tripAdvice?.splitStayAdvice).toBeUndefined();
  });
});

const plan = (): TripPlanOutput => ({
  destination: "Tokyo",
  country: "Japan",
  weather: {
    bestMonth: "April",
    summary: "Mild.",
    temperatureRangeCelsius: "12-20C",
  },
  paidAttractions: [],
  days: [
    {
      dayNumber: 1,
      city: "Tokyo",
      attractions: [],
      lodging: "Shinjuku",
    },
  ],
});
