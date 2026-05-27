import { describe, expect, it, vi } from "vitest";

import { enrichDayRoutes } from "@/services/routes/day-route-enricher";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

describe("enrichDayRoutes", () => {
  it("attaches route summaries to consecutive resolved stops", async () => {
    const computeRoute = vi.fn().mockResolvedValue({ durationMinutes: 9 });

    const enriched = await enrichDayRoutes(plan(), {
      routesClient: { computeRoute },
    });

    expect(computeRoute).toHaveBeenCalledTimes(3);
    expect(enriched.days[0]?.slots?.[1]?.routeFromPrevious).toMatchObject({
      fromSlotId: "a",
      toSlotId: "b",
      modes: {
        walking: { durationMinutes: 9 },
        driving: { durationMinutes: 9 },
        transit: { durationMinutes: 9 },
      },
    });
  });

  it("uses fallback durations when the route client returns null", async () => {
    const enriched = await enrichDayRoutes(plan(), {
      routesClient: { computeRoute: vi.fn().mockResolvedValue(null) },
    });

    expect(
      enriched.days[0]?.slots?.[1]?.routeFromPrevious?.modes.walking
        ?.durationMinutes,
    ).toBe(15);
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
      slots: [
        {
          id: "a",
          dayNumber: 1,
          startTime: "09:00",
          kind: "attraction",
          title: "A",
          city: "Tokyo",
          resolvedPlace: {
            source: "google_places",
            placeId: "a",
            name: "A",
          },
        },
        {
          id: "b",
          dayNumber: 1,
          startTime: "10:00",
          kind: "meal",
          title: "B",
          city: "Tokyo",
          resolvedPlace: {
            source: "google_places",
            placeId: "b",
            name: "B",
          },
        },
      ],
    },
  ],
});
