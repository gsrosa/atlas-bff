import { describe, expect, it } from "vitest";

import { buildAiModel, hasAiProvider } from "@/ai/client";

import { buildTestEnv } from "./helpers/test-env";

describe("AI client", () => {
  it("reports configured providers", () => {
    expect(hasAiProvider(buildTestEnv())).toBe(false);
    expect(hasAiProvider(buildTestEnv({ GEMINI_API_KEY: "gemini-key" }))).toBe(
      true,
    );
    expect(hasAiProvider(buildTestEnv({ OPENAI_API_KEY: "openai-key" }))).toBe(
      true,
    );
  });

  it("builds an OpenAI fallback model when Gemini is unset", () => {
    expect(() =>
      buildAiModel(buildTestEnv({ OPENAI_API_KEY: "openai-key" })),
    ).not.toThrow();
  });
});
