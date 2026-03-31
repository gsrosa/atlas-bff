import { describe, expect, it } from "vitest";

import {
  createTripPlanInputSchema,
  listTripPlansInputSchema,
  tripPlanIdInputSchema,
} from "@/shared/validation-schema/trip-plans";

describe("trip plan Zod schemas", () => {
  it("createTripPlanInputSchema accepts minimal payload", () => {
    const out = createTripPlanInputSchema.parse({
      title: "Paris",
      destinationCountry: "FR",
    });
    expect(out.flightNumbers).toEqual([]);
    expect(out.formSnapshot).toEqual({});
    expect(out.itinerary).toEqual({});
  });

  it("createTripPlanInputSchema rejects invalid destinationCountry length", () => {
    expect(() =>
      createTripPlanInputSchema.parse({ destinationCountry: "FRA" }),
    ).toThrow();
  });

  it("listTripPlansInputSchema defaults limit", () => {
    expect(listTripPlansInputSchema.parse({})).toEqual({ limit: 50 });
    expect(listTripPlansInputSchema.parse({ limit: 10 })).toEqual({ limit: 10 });
  });

  it("tripPlanIdInputSchema accepts uuid", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(tripPlanIdInputSchema.parse({ id })).toEqual({ id });
  });
});
