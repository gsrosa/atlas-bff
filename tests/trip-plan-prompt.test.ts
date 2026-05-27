import { describe, expect, it } from "vitest";

import {
  TRIP_PLAN_PROMPT_VERSION,
  TRIP_PLAN_SYSTEM_PROMPT,
} from "@/ai/prompts";

describe("trip plan prompt", () => {
  it("requires timed slots and keeps compatibility fields", () => {
    expect(TRIP_PLAN_PROMPT_VERSION).toBe("1.1.0");
    expect(TRIP_PLAN_SYSTEM_PROMPT).toContain(
      'Every day must include a non-empty "slots" array',
    );
    expect(TRIP_PLAN_SYSTEM_PROMPT).toContain(
      "Attractions compatibility field",
    );
    expect(TRIP_PLAN_SYSTEM_PROMPT).toContain(
      'Meal slots should include a restaurant "resolve" request',
    );
  });
});
