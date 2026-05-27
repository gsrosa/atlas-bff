import { describe, expect, it, vi } from "vitest";

import { adaptSlotsForCompatibility } from "@/services/itinerary/slot-adapter";
import { normalizeTripAdvice } from "@/services/itinerary/trip-advice";
import { buildDayMapRoutes } from "@/services/maps/day-map-builder";
import { resolvePlaceSlots } from "@/services/places/place-resolver";
import { enrichDayRoutes } from "@/services/routes/day-route-enricher";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

describe("enriched itinerary flow", () => {
  it("builds slots, resolved meals, route durations, maps, and advice", async () => {
    const placesClient = {
      searchText: vi.fn().mockResolvedValue([
        {
          placeId: "ramen-house",
          name: "Ramen House",
          address: "1 Ueno, Tokyo",
          location: { lat: 35.716, lng: 139.775 },
          rating: 4.5,
          userRatingsTotal: 1000,
        },
      ]),
    };
    const routesClient = {
      computeRoute: vi.fn().mockResolvedValue({ durationMinutes: 8 }),
    };

    const adapted = adaptSlotsForCompatibility(plan());
    const resolved = await resolvePlaceSlots(adapted, { placesClient });
    const routed = await enrichDayRoutes(resolved, { routesClient });
    const mapped = buildDayMapRoutes(routed);
    const finalPlan = normalizeTripAdvice(mapped);

    expect(finalPlan.days[0]?.slots?.[1]?.resolvedPlace?.name).toBe(
      "Ramen House",
    );
    expect(finalPlan.days[0]?.slots?.[1]?.routeFromPrevious?.modes.walking).toEqual({
      durationMinutes: 8,
    });
    expect(finalPlan.days[0]?.mapRoute?.mapsUrl).toContain(
      "https://www.google.com/maps/dir/",
    );
    expect(finalPlan.days[0]?.meals?.[0]?.name).toBe("Ramen House");
    expect(finalPlan.tripAdvice?.bestAreasToStay[0]?.area).toBe("Shinjuku");
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
      lodging: "Shinjuku",
      attractions: [],
      slots: [
        {
          id: "ueno",
          dayNumber: 1,
          startTime: "09:00",
          durationMinutes: 120,
          kind: "attraction",
          title: "Ueno Park",
          city: "Tokyo",
          resolvedPlace: {
            source: "google_places",
            placeId: "ueno",
            name: "Ueno Park",
            location: { lat: 35.7156, lng: 139.7745 },
          },
        },
        {
          id: "lunch",
          dayNumber: 1,
          startTime: "13:00",
          durationMinutes: 60,
          kind: "meal",
          title: "Lunch near Ueno",
          city: "Tokyo",
          resolve: {
            kind: "restaurant",
            priority: "required",
            query: "ramen near Ueno",
            slot: "lunch",
            city: "Tokyo",
            allowUnresolved: true,
          },
        },
      ],
    },
  ],
});
