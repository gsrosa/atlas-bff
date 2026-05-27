import { TRIP_PLAN_PROMPT_VERSION } from "@/ai/prompts";
import type { Env } from "@/env";
import { adaptSlotsForCompatibility } from "@/services/itinerary/slot-adapter";
import { normalizeTripAdvice } from "@/services/itinerary/trip-advice";
import { buildDayMapRoutes } from "@/services/maps/day-map-builder";
import { GooglePlacesClient } from "@/services/places/google-places.client";
import { resolveMealSlots } from "@/services/places/place-resolver";
import { enrichDayRoutes } from "@/services/routes/day-route-enricher";
import { GoogleRoutesClient } from "@/services/routes/google-routes.client";
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
      buildTripPlanCacheKeyInput(
        answers,
        aiQuestions,
        aiAnswers,
        tripDetails,
        TRIP_PLAN_PROMPT_VERSION,
      ),
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
    const generated = adaptSlotsForCompatibility(
      await generateTripPlanWithQuality({
        env,
        endpoint: "trip",
        promptVersion: TRIP_PLAN_PROMPT_VERSION,
        userId: opts?.userId,
        system: systemPrompt,
        prompt: userPrompt,
        maxOutputTokens: 32768,
        temperature: 0.7,
        expectedDays: effectiveDays,
      }),
    );
    const withMeals = await resolveMealSlots(generated, {
      placesClient: new GooglePlacesClient(env),
    });
    const withRoutes = await enrichDayRoutes(withMeals, {
      routesClient: new GoogleRoutesClient(env),
    });
    const result = normalizeTripAdvice(buildDayMapRoutes(withRoutes));
    await setCachedTripPlan(env, cacheKey, result);
    return result;
  }
}
