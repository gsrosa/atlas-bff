import { describe, expect, it } from "vitest";

import { buildPlanCacheKey } from "@/services/ai-services/ai-generate.service";
import { buildTripPlanCacheKeyInput } from "@/services/ai-services/plan-cache";
import type { AiQuestionInput } from "@/shared/validation-schema/planner-input";

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

  it("varies by trip prompt version", () => {
    const answers = { "destination-in-mind": "Tokyo" };
    const aiQuestions: AiQuestionInput[] = [];
    const aiAnswers = {};

    expect(
      buildPlanCacheKey(
        buildTripPlanCacheKeyInput(
          answers,
          aiQuestions,
          aiAnswers,
          undefined,
          "1.0.0",
        ),
      ),
    ).not.toBe(
      buildPlanCacheKey(
        buildTripPlanCacheKeyInput(
          answers,
          aiQuestions,
          aiAnswers,
          undefined,
          "1.1.0",
        ),
      ),
    );
  });
});
