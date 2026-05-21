import { createGoogleGenerativeAI } from "@ai-sdk/google";

import type { Env } from "@/env";

export function buildAiModel(env: Env) {
  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY! });
  return google(env.GEMINI_MODEL);
}

export function buildAiModelWithName(env: Env, model: string) {
  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY! });
  return google(model);
}

/** Disables thinking for generateObject calls — ensures clean JSON output. */
export const NO_THINKING = {
  google: { thinkingConfig: { thinkingBudget: 0 } },
} as const;
