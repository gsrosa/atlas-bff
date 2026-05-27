import { createHash } from "node:crypto";

import type { Env } from "@/env";
import { getRedis } from "@/lib/redis";
import { PLAN_CACHE_PREFIX, PLAN_CACHE_TTL_SECONDS } from "@/shared/constants";
import {
  type TripPlanOutput,
  tripPlanOutputSchema,
} from "@/shared/validation-schema/ai-output";
import type {
  AiQuestionInput,
  AnswerMap,
  TripDetails,
} from "@/shared/validation-schema/planner-input";

export const buildPlanCacheKey = (input: unknown): string => {
  return createHash("sha256").update(stableStringify(input)).digest("hex");
};

export const getCachedTripPlan = async (
  env: Env,
  cacheKey: string,
): Promise<TripPlanOutput | null> => {
  try {
    const raw = await getRedis(env).get(`${PLAN_CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    return tripPlanOutputSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const setCachedTripPlan = async (
  env: Env,
  cacheKey: string,
  plan: TripPlanOutput,
): Promise<void> => {
  try {
    await getRedis(env).setex(
      `${PLAN_CACHE_PREFIX}${cacheKey}`,
      PLAN_CACHE_TTL_SECONDS,
      JSON.stringify(plan),
    );
  } catch {
    return;
  }
};

export const buildTripPlanCacheKeyInput = (
  answers: AnswerMap,
  aiQuestions: AiQuestionInput[],
  aiAnswers: AnswerMap,
  tripDetails?: TripDetails,
  promptVersion?: string,
) => ({
  answers,
  aiQuestions,
  aiAnswers,
  promptVersion: promptVersion ?? null,
  tripDetails: tripDetails ?? null,
});

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
};
