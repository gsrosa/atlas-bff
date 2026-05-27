import { describe, expect, it } from "vitest";

import { buildRouteCacheKey } from "@/services/routes/route-cache";

describe("buildRouteCacheKey", () => {
  it("normalizes route cache inputs", () => {
    expect(
      buildRouteCacheKey({
        origin: " Place A ",
        destination: "Place B",
        mode: "Walking",
      }),
    ).toBe("route:place-a:place-b:walking:anytime");
  });
});
