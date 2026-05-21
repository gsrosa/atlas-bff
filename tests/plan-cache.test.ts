import { describe, expect, it } from "vitest";

import { buildPlanCacheKey } from "@/services/ai-generate.service";

describe("buildPlanCacheKey", () => {
  it("is stable for equivalent object key ordering", () => {
    expect(
      buildPlanCacheKey({
        answers: { b: "two", a: "one" },
        aiAnswers: { c: ["x", "y"] },
      }),
    ).toBe(
      buildPlanCacheKey({
        aiAnswers: { c: ["x", "y"] },
        answers: { a: "one", b: "two" },
      }),
    );
  });
});
