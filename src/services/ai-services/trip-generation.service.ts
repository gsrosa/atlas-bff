import { Output, stepCountIs, streamText } from "ai";

import { buildAiModel, NO_THINKING } from "@/ai/client";
import { logAiCall } from "@/ai/logger";
import { TRIP_PLAN_PROMPT_VERSION } from "@/ai/prompts";
import { buildTripGenerationTools } from "@/ai/tools";
import type { Env } from "@/env";
import {
  type TripPlanOutput,
  tripPlanOutputSchema,
} from "@/shared/validation-schema/ai-output";
import type {
  AiQuestionInput,
  AnswerMap,
  TripDetails,
} from "@/shared/validation-schema/planner-input";
import {
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
} from "@/utils/credit";

import { generateTripPlanWithQuality } from "./generation-core";
import {
  buildPlanCacheKey,
  buildTripPlanCacheKeyInput,
  getCachedTripPlan,
  setCachedTripPlan,
} from "./plan-cache";
import { buildTripPlanPrompt } from "./trip-prompt";

type StreamTripPlanResult = {
  result: {
    partialObjectStream: AsyncIterable<unknown>;
    object: Promise<TripPlanOutput>;
  };
  expectedDays: number | null;
};

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

  static async streamTripPlanFromAnswers(
    env: Env,
    answers: AnswerMap,
    aiQuestions: AiQuestionInput[],
    aiAnswers: AnswerMap,
    opts?: { accessToken?: string; userId?: string },
    tripDetails?: TripDetails,
  ): Promise<StreamTripPlanResult> {
    const cacheKey = buildPlanCacheKey(
      buildTripPlanCacheKeyInput(answers, aiQuestions, aiAnswers, tripDetails),
    );
    const cached = await getCachedTripPlan(env, cacheKey);
    if (cached) {
      return {
        result: {
          partialObjectStream: (async function* () {
            yield cached;
          })(),
          object: Promise.resolve(cached),
        },
        expectedDays:
          deriveDayCountFromHotels(tripDetails?.hotels ?? []) ??
          deriveDayCountFromAnswers(answers),
      };
    }

    const { systemPrompt, userPrompt, effectiveDays } =
      await buildTripPlanPrompt(
        env,
        answers,
        aiQuestions,
        aiAnswers,
        opts,
        tripDetails,
      );
    const start = Date.now();
    const correlationId = crypto.randomUUID();
    const result = streamText({
      model: buildAiModel(env),
      providerOptions: NO_THINKING,
      output: Output.object({
        schema: tripPlanOutputSchema,
        name: "TripPlan",
        description: "Complete day-by-day trip plan JSON.",
      }),
      tools: buildTripGenerationTools(env),
      stopWhen: stepCountIs(5),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 32768,
      temperature: 0.7,
      onFinish: ({ usage }) => {
        logAiCall({
          correlationId,
          endpoint: "trip",
          promptVersion: TRIP_PLAN_PROMPT_VERSION,
          model: env.GEMINI_MODEL,
          userId: opts?.userId,
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
          latencyMs: Date.now() - start,
          success: true,
          zodValid: true,
        });
      },
    });

    return {
      result: {
        partialObjectStream: result.partialOutputStream,
        object: Promise.resolve(result.output).then(async (plan) => {
          await setCachedTripPlan(env, cacheKey, plan);
          return plan;
        }),
      },
      expectedDays: effectiveDays,
    };
  }
}
