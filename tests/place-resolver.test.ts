import { describe, expect, it, vi } from "vitest";

import {
  resolveMealSlots,
  resolvePlaceSlots,
} from "@/services/places/place-resolver";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

const plan: TripPlanOutput = {
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
          id: "ueno",
          dayNumber: 1,
          startTime: "09:00",
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
          kind: "meal",
          title: "Lunch near Ueno",
          city: "Tokyo",
          resolve: {
            kind: "restaurant",
            priority: "required",
            query: "ramen near Ueno",
            slot: "lunch",
            city: "Tokyo",
            cuisineHints: ["ramen"],
            allowUnresolved: true,
          },
        },
      ],
    },
  ],
};

describe("resolveMealSlots", () => {
  it("patches meal slots with selected Google Places candidates", async () => {
    const searchText = vi.fn().mockResolvedValue([
      {
        placeId: "ramen-house",
        name: "Ramen House",
        address: "1 Ueno, Tokyo",
        rating: 4.4,
        userRatingsTotal: 500,
        location: { lat: 35.7158, lng: 139.7747 },
        mapsUrl: "https://maps.google.com/ramen-house",
      },
    ]);

    const resolved = await resolveMealSlots(plan, {
      placesClient: { searchText },
    });

    expect(searchText).toHaveBeenCalledWith(
      expect.stringContaining("ramen near Ueno"),
      expect.objectContaining({
        locationBias: { lat: 35.7156, lng: 139.7745, radiusMeters: 1500 },
      }),
    );
    expect(resolved.days[0]?.slots?.[1]?.resolvedPlace?.name).toBe(
      "Ramen House",
    );
    expect(resolved.days[0]?.meals?.[0]?.name).toBe("Ramen House");
  });

  it("keeps meal slots unresolved when no candidate is usable", async () => {
    const resolved = await resolveMealSlots(plan, {
      placesClient: { searchText: vi.fn().mockResolvedValue([]) },
    });

    expect(resolved.days[0]?.slots?.[1]?.resolvedPlace).toBeUndefined();
    expect(resolved.days[0]?.meals?.[0]?.name).toBe("Lunch near Ueno");
  });
});

describe("resolvePlaceSlots", () => {
  it("patches attraction slots with selected Google Places candidates", async () => {
    const searchText = vi.fn().mockResolvedValue([
      {
        placeId: "sensoji",
        name: "Senso-ji",
        address: "2 Chome-3-1 Asakusa, Tokyo",
        rating: 4.5,
        userRatingsTotal: 90000,
      },
    ]);
    const resolved = await resolvePlaceSlots(
      {
        ...plan,
        days: [
          {
            ...plan.days[0]!,
            slots: [
              {
                id: "sensoji",
                dayNumber: 1,
                startTime: "09:00",
                kind: "attraction",
                title: "Visit Senso-ji",
                city: "Tokyo",
                resolve: {
                  kind: "attraction",
                  priority: "nice_to_have",
                  query: "Senso-ji Tokyo",
                  city: "Tokyo",
                  allowUnresolved: true,
                },
              },
            ],
          },
        ],
      },
      {
        placesClient: { searchText },
      },
    );

    expect(resolved.days[0]?.slots?.[0]?.resolvedPlace?.placeId).toBe("sensoji");
    expect(resolved.days[0]?.attractions[0]?.name).toBe("Senso-ji");
  });
});
