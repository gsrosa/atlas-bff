import { describe, expect, it } from "vitest";

import { buildAIContextBlock } from "@/services/traveler-profile-ai-context";

describe("buildAIContextBlock", () => {
  it("returns trip-only text when profile is empty", () => {
    const trip = "BASE PREFERENCES:\n- Who: solo";
    expect(buildAIContextBlock(null, trip)).toBe(trip);
    expect(buildAIContextBlock({}, trip)).toBe(trip);
  });

  it("prepends user profile and wraps trip in [This Trip]", () => {
    const out = buildAIContextBlock(
      { diet: "vegan", foodAdventurousness: 4, interests: ["food-drink"] },
      "BASE PREFERENCES:\n- Who: solo",
    );
    expect(out).toContain("[User Profile]");
    expect(out).toContain("Diet: Vegan");
    expect(out).toContain("Food adventurousness: 4/5");
    expect(out).toContain("[This Trip]");
    expect(out).toContain("solo");
    expect(out).toContain("[Resolved constraints]");
  });
});
