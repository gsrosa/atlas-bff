import { describe, expect, it } from "vitest";

import { adaptSlotsForCompatibility } from "@/services/itinerary/slot-adapter";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

const buildPlan = (
  day: TripPlanOutput["days"][number],
): TripPlanOutput => ({
  destination: "Tokyo",
  country: "Japan",
  weather: {
    bestMonth: "April",
    summary: "Mild spring weather.",
    temperatureRangeCelsius: "12-20C",
  },
  days: [day],
  paidAttractions: [],
});

describe("adaptSlotsForCompatibility", () => {
  it("keeps old attraction-first days unchanged when slots are missing", () => {
    const day: TripPlanOutput["days"][number] = {
      dayNumber: 1,
      city: "Tokyo",
      attractions: [{ name: "Ueno Park" }],
    };

    expect(adaptSlotsForCompatibility(buildPlan(day)).days[0]).toEqual(day);
  });

  it("derives compatibility fields from slots", () => {
    const adapted = adaptSlotsForCompatibility(
      buildPlan({
        dayNumber: 1,
        city: "Tokyo",
        attractions: [],
        slots: [
          {
            id: "day-1-0900-ueno",
            dayNumber: 1,
            startTime: "09:00",
            durationMinutes: 120,
            kind: "attraction",
            title: "Visit Ueno Park",
            city: "Tokyo",
            area: "Ueno",
            estimatedPrice: {
              min: 0,
              currency: "USD",
              label: "Free",
            },
            resolvedPlace: {
              source: "google_places",
              placeId: "ueno",
              name: "Ueno Park",
              address: "Uenokoen, Taito City, Tokyo",
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
              query: "ramen near Ueno",
              slot: "lunch",
              city: "Tokyo",
              allowUnresolved: true,
            },
          },
          {
            id: "day-1-1500-transfer",
            dayNumber: 1,
            startTime: "15:00",
            durationMinutes: 25,
            kind: "transport",
            title: "Transfer to Asakusa",
            city: "Tokyo",
            routeFromPrevious: {
              fromSlotId: "day-1-1300-lunch",
              toSlotId: "day-1-1500-transfer",
              recommendedMode: "transit",
              modes: {
                transit: { durationMinutes: 25 },
              },
            },
          },
        ],
      }),
    );

    expect(adapted.days[0]?.attractions).toEqual([
      {
        name: "Ueno Park",
        address: "Uenokoen, Taito City, Tokyo",
        averageMinutesSpent: 120,
        category: "attraction",
        notes: undefined,
        price: { amount: 0, currency: "USD" },
      },
    ]);
    expect(adapted.days[0]?.meals).toEqual([
      {
        name: "Lunch near Ueno",
        type: "lunch",
        notes: undefined,
      },
    ]);
    expect(adapted.days[0]?.transportation).toEqual([
      {
        from: "Lunch near Ueno",
        to: "Transfer to Asakusa",
        mode: "transit",
        durationMinutes: 25,
        notes: undefined,
      },
    ]);
  });

  it("normalizes blank and duplicate slot ids", () => {
    const adapted = adaptSlotsForCompatibility(
      buildPlan({
        dayNumber: 2,
        city: "Lisbon",
        attractions: [],
        slots: [
          {
            id: "",
            dayNumber: 99,
            startTime: "09:00",
            kind: "activity",
            title: "Walk Alfama",
            city: "Lisbon",
          },
          {
            id: "",
            dayNumber: 99,
            startTime: "09:00",
            kind: "activity",
            title: "Walk Alfama",
            city: "Lisbon",
          },
        ],
      }),
    );

    expect(adapted.days[0]?.slots?.map((slot) => slot.id)).toEqual([
      "day-2-0900-walk-alfama",
      "day-2-0900-walk-alfama-2",
    ]);
    expect(adapted.days[0]?.slots?.map((slot) => slot.dayNumber)).toEqual([
      2,
      2,
    ]);
  });
});
