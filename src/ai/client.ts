import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

import type { Env } from "@/env";

export function buildAiModel(env: Env): LanguageModel {
  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY! });
  return google(env.GEMINI_MODEL);
}

export function buildAiModelWithName(env: Env, model: string): LanguageModel {
  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY! });
  return google(model);
}

/** Disables thinking for generateObject calls — ensures clean JSON output. */
export const NO_THINKING = {
  google: { thinkingConfig: { thinkingBudget: 0 } },
} as const;
