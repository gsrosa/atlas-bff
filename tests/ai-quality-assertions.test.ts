import { describe, expect, it } from "vitest";

import {
  AiQualityError,
  assertTripPlanQuality,
} from "@/ai/guards/quality-assertions";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

const buildPlan = (
  days: TripPlanOutput["days"],
): TripPlanOutput => ({
  destination: "Tokyo",
  country: "Japan",
  weather: {
    bestMonth: "April",
    summary: "Mild spring weather.",
    temperatureRangeCelsius: "12-20C",
  },
  days,
  paidAttractions: [],
});

describe("assertTripPlanQuality", () => {
  it("accepts a plan with expected day count, city, and specific lodging", () => {
    const plan = buildPlan([
      {
        dayNumber: 1,
        city: "Tokyo",
        attractions: [],
        lodging: "Mid-range hotel in Shinjuku, Tokyo",
      },
      {
        dayNumber: 2,
        city: "Tokyo",
        attractions: [],
        lodging: "Mid-range hotel in Shinjuku, Tokyo",
      },
    ]);

    expect(() =>
      assertTripPlanQuality(plan, { expectedDays: 2 }),
    ).not.toThrow();
  });

  it("rejects a wrong day count", () => {
    const plan = buildPlan([
      {
        dayNumber: 1,
        city: "Tokyo",
        attractions: [],
        lodging: "Boutique hostel in Asakusa, Tokyo",
      },
    ]);

    expect(() => assertTripPlanQuality(plan, { expectedDays: 2 })).toThrow(
      AiQualityError,
    );
  });

  it("rejects missing city and generic lodging", () => {
    const plan = buildPlan([
      {
        dayNumber: 1,
        city: "",
        attractions: [],
        lodging: "hotel",
      },
    ]);

    expect(() => assertTripPlanQuality(plan)).toThrow(
      /day 1 is missing city; day 1 has generic lodging/,
    );
  });
});
