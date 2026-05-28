import { describe, expect, it } from "vitest";

import { tripItineraryDocumentSchema } from "@/shared/dtos/itinerary-ai";
import { tripPlanOutputSchema } from "@/shared/validation-schema/ai-output";

const oldShapePlan = {
  destination: "Tokyo",
  country: "Japan",
  weather: {
    bestMonth: "April",
    summary: "Mild spring weather.",
    temperatureRangeCelsius: "12-20C",
  },
  days: [
    {
      dayNumber: 1,
      city: "Tokyo",
      attractions: [
        {
          name: "Ueno Park",
          address: "Uenokoen, Taito City, Tokyo",
          averageMinutesSpent: 120,
        },
      ],
    },
  ],
  paidAttractions: [],
};

const slotShapePlan = {
  title: "Tokyo, Japan",
  destination: "Tokyo",
  country: "Japan",
  weather: {
    bestMonth: "April",
    summary: "Mild spring weather.",
    temperatureRangeCelsius: "12-20C",
  },
  days: [
    {
      dayNumber: 1,
      city: "Tokyo",
      slots: [
        {
          id: "day-1-0900-ueno-park",
          dayNumber: 1,
          startTime: "09:00",
          durationMinutes: 120,
          kind: "attraction",
          title: "Visit Ueno Park",
          city: "Tokyo",
          area: "Ueno",
          estimatedPrice: {
            currency: "USD",
            label: "Free",
          },
          resolve: {
            kind: "attraction",
            priority: "nice_to_have",
            query: "Ueno Park Tokyo",
            city: "Tokyo",
            country: "Japan",
            allowUnresolved: true,
          },
          resolvedPlace: {
            source: "google_places",
            placeId: "place-ueno-park",
            name: "Ueno Park",
            address: "Uenokoen, Taito City, Tokyo",
            rating: 4.4,
            userRatingsTotal: 50000,
            location: {
              lat: 35.7156,
              lng: 139.7745,
            },
            mapsUrl: "https://maps.google.com/?cid=ueno",
          },
        },
        {
          id: "day-1-1300-lunch",
          dayNumber: 1,
          startTime: "13:00",
          durationMinutes: 60,
          kind: "meal",
          title: "Lunch near Ueno",
          city: "Tokyo",
          resolve: {
            kind: "restaurant",
            priority: "required",
            query: "lunch restaurant near Ueno Tokyo",
            slot: "lunch",
            city: "Tokyo",
            country: "Japan",
            nearSlotId: "day-1-0900-ueno-park",
            cuisineHints: ["ramen"],
            budgetHint: "moderate",
            allowUnresolved: true,
          },
          routeFromPrevious: {
            fromSlotId: "day-1-0900-ueno-park",
            toSlotId: "day-1-1300-lunch",
            modes: {
              walking: {
                durationMinutes: 12,
                distanceMeters: 900,
              },
              driving: {
                durationMinutes: 6,
              },
              transit: {
                durationMinutes: 15,
              },
            },
            recommendedMode: "walking",
          },
        },
      ],
      mapRoute: {
        dayNumber: 1,
        mapsUrl: "https://www.google.com/maps/dir/?api=1",
        placeIds: ["place-ueno-park"],
        unresolvedStopTitles: ["Lunch near Ueno"],
      },
      attractions: [],
    },
  ],
  paidAttractions: [],
  tripAdvice: {
    bestAreasToStay: [
      {
        area: "Ueno",
        reason: "Good transit access for the planned route.",
        bestFor: ["museums", "parks"],
      },
    ],
    shouldSplitStay: false,
    transportAdvice: ["Use trains for cross-city moves."],
  },
  meta: {
    placeResolveStats: {
      requested: 2,
      resolved: 1,
      unresolved: 1,
    },
  },
};

describe("trip plan AI output schema", () => {
  it("accepts the current attraction-first output shape", () => {
    const parsed = tripPlanOutputSchema.parse(oldShapePlan);

    expect(parsed.days[0]?.attractions).toHaveLength(1);
  });

  it("accepts a slot-first output shape with compatibility fields", () => {
    const parsed = tripPlanOutputSchema.parse(slotShapePlan);

    expect(parsed.days[0]?.attractions).toEqual([]);
    expect(parsed.days[0]?.slots).toHaveLength(2);
    expect(parsed.title).toBe("Tokyo, Japan");
    expect(parsed.days[0]?.mapRoute?.placeIds).toEqual(["place-ueno-park"]);
    expect(parsed.tripAdvice?.shouldSplitStay).toBe(false);
    expect(parsed.meta?.placeResolveStats?.requested).toBe(2);
  });

  it("accepts slot data in the stored itinerary document schema", () => {
    const parsed = tripItineraryDocumentSchema.parse(slotShapePlan);

    expect(parsed.days[0]?.slots?.[0]?.resolvedPlace?.placeId).toBe(
      "place-ueno-park",
    );
  });
});
