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

  it("listTripPlansInputSchema defaults limit to 10 and page to 0", () => {
    expect(listTripPlansInputSchema.parse({})).toEqual({ limit: 10, page: 0 });
  });

  it("listTripPlansInputSchema accepts explicit limit and page", () => {
    expect(listTripPlansInputSchema.parse({ limit: 20, page: 3 })).toEqual({ limit: 20, page: 3 });
  });

  it("listTripPlansInputSchema rejects negative page", () => {
    expect(() => listTripPlansInputSchema.parse({ page: -1 })).toThrow();
  });

  it("tripPlanIdInputSchema accepts uuid", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(tripPlanIdInputSchema.parse({ id })).toEqual({ id });
  });
});
