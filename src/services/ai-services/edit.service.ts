import {
  TRIP_PLAN_PROMPT_VERSION,
  TRIP_PLAN_SYSTEM_PROMPT,
} from "@/ai/prompts";
import type { Env } from "@/env";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

import { generateTripPlanWithQuality } from "./generation-core";

export class EditTripPlanService {
  static async editTripPlan(
    env: Env,
    opts: { userPrompt: string; maxTokens?: number; temperature?: number },
  ): Promise<TripPlanOutput> {
    return generateTripPlanWithQuality({
      env,
      endpoint: "edit",
      promptVersion: TRIP_PLAN_PROMPT_VERSION,
      system: TRIP_PLAN_SYSTEM_PROMPT,
      prompt: opts.userPrompt,
      maxOutputTokens: opts.maxTokens ?? 32768,
      temperature: opts.temperature ?? 0.1,
    });
  }
}
