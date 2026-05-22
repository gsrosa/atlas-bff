import { TRIP_PLAN_PROMPT_VERSION } from "@/ai/prompts";
import type { Env } from "@/env";
import { type TripPlanOutput } from "@/shared/validation-schema/ai-output";
import type {
  AiQuestionInput,
  AnswerMap,
  TripDetails,
} from "@/shared/validation-schema/planner-input";

import { generateTripPlanWithQuality } from "./generation-core";
import {
  buildPlanCacheKey,
  buildTripPlanCacheKeyInput,
  getCachedTripPlan,
  setCachedTripPlan,
} from "./plan-cache";
import { buildTripPlanPrompt } from "./trip-prompt";

export class TripGenerationService {
  static async generateTripPlanFromAnswers(
    env: Env,
    answers: AnswerMap,
    aiQuestions: AiQuestionInput[],
    aiAnswers: AnswerMap,
    opts?: { accessToken?: string; userId?: string },
    tripDetails?: TripDetails,
  ): Promise<TripPlanOutput> {
    const cacheKey = buildPlanCacheKey(
      buildTripPlanCacheKeyInput(answers, aiQuestions, aiAnswers, tripDetails),
    );
    const cached = await getCachedTripPlan(env, cacheKey);
    if (cached) return cached;

    const { systemPrompt, userPrompt, effectiveDays } =
      await buildTripPlanPrompt(
        env,
        answers,
        aiQuestions,
        aiAnswers,
        opts,
        tripDetails,
      );
    const result = await generateTripPlanWithQuality({
      env,
      endpoint: "trip",
      promptVersion: TRIP_PLAN_PROMPT_VERSION,
      userId: opts?.userId,
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 32768,
      temperature: 0.7,
      expectedDays: effectiveDays,
    });
    await setCachedTripPlan(env, cacheKey, result);
    return result;
  }
}
