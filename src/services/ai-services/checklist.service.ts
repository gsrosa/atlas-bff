import {
  CHECKLIST_PROMPT_VERSION,
  CHECKLIST_SYSTEM_PROMPT,
} from "@/ai/prompts";
import type { Env } from "@/env";
import { TravelerProfileService } from "@/services/traveler-profile.service";
import {
  type ChecklistOutput,
  checklistOutputSchema,
} from "@/shared/validation-schema/ai-output";
import type {
  AnswerMap,
  TripDetails,
} from "@/shared/validation-schema/planner-input";

import { generate } from "./generation-core";
import { buildAIContextBlock } from "./traveler-profile-ai-context";
import { buildAnswerSummary } from "./trip-prompt";

export class ChecklistService {
  static async generateChecklistFromAnswers(
    env: Env,
    answers: AnswerMap,
    opts?: { accessToken?: string; userId?: string },
    tripDetails?: TripDetails,
  ): Promise<ChecklistOutput> {
    const baseSummary = buildAnswerSummary(answers, tripDetails);
    let mergedContext = buildAIContextBlock(null, baseSummary);

    if (opts?.accessToken && opts.userId) {
      try {
        const { preferences } =
          await TravelerProfileService.getTravelerPreferences(
            env,
            opts.accessToken,
            opts.userId,
          );
        mergedContext = buildAIContextBlock(preferences, baseSummary);
      } catch {
        mergedContext = buildAIContextBlock(null, baseSummary);
      }
    }

    const userPrompt =
      `${mergedContext}\n\n` +
      `Generate 5-7 personalised follow-up questions.\n\n` +
      `Priorities:\n` +
      `1) Activities and experiences that fit timing, climate, and regions.\n` +
      `2) Must-haves vs things to avoid for this specific trip.\n` +
      `3) Physical level or comfort where it affects activity choice.\n` +
      `4) Any gap needed to build a coherent day-by-day plan.\n\n` +
      `Do not re-ask the base fields.`;

    return generate({
      env,
      endpoint: "checklist",
      promptVersion: CHECKLIST_PROMPT_VERSION,
      userId: opts?.userId,
      schema: checklistOutputSchema,
      system: CHECKLIST_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 8192,
      temperature: 0.7,
    });
  }
}
