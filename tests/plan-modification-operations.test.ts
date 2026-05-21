import { describe, expect, it } from "vitest";

import {
  applyTripPlanOperations,
  type PlanModificationOperation,
} from "@/services/ai-generate.service";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

const basePlan: TripPlanOutput = {
  destination: "Tokyo",
  country: "Japan",
  weather: {
    bestMonth: "April",
    summary: "Mild.",
    temperatureRangeCelsius: "12-20C",
  },
  days: [
    {
      dayNumber: 1,
      city: "Tokyo",
      attractions: [{ name: "Senso-ji" }],
      lodging: "Mid-range hotel in Shinjuku, Tokyo",
    },
  ],
  paidAttractions: [],
};

describe("applyTripPlanOperations", () => {
  it("updates lodging without changing other day fields", () => {
    const operations: PlanModificationOperation[] = [
      {
        type: "updateDayLodging",
        dayNumbers: [1],
        lodging: "Boutique hotel in Ginza, Tokyo",
      },
    ];

    const result = applyTripPlanOperations(basePlan, operations);

    expect(result.days[0]?.lodging).toBe("Boutique hotel in Ginza, Tokyo");
    expect(result.days[0]?.attractions).toEqual([{ name: "Senso-ji" }]);
  });

  it("adds an attraction to the selected day", () => {
    const operations: PlanModificationOperation[] = [
      {
        type: "addAttraction",
        dayNumber: 1,
        attraction: { name: "Tokyo Skytree", address: "1 Chome-1-2 Oshiage" },
      },
    ];

    const result = applyTripPlanOperations(basePlan, operations);

    expect(result.days[0]?.attractions).toHaveLength(2);
    expect(result.days[0]?.attractions[1]?.name).toBe("Tokyo Skytree");
  });
});
