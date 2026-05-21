import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import type { Env } from "@/env";

export function buildAiModel(env: Env): LanguageModel {
  if (env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
    return google(env.GEMINI_MODEL);
  }

  if (env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    return openai(env.OPENAI_MODEL);
  }

  throw new Error("No AI provider configured");
}

export function buildAiModelWithName(env: Env, model: string): LanguageModel {
  if (env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
    return google(model);
  }

  if (env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    return openai(model);
  }

  throw new Error("No AI provider configured");
}

export function hasAiProvider(env: Env): boolean {
  return Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY);
}

/** Disables thinking for generateObject calls — ensures clean JSON output. */
export const NO_THINKING = {
  google: { thinkingConfig: { thinkingBudget: 0 } },
} as const;
