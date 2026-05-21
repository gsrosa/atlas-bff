import { generateObject } from "ai";
import type { ZodSchema } from "zod";

import { buildAiModel, NO_THINKING } from "@/ai/client";
import { assertTripPlanQuality } from "@/ai/guards/quality-assertions";
import { logAiCall } from "@/ai/logger";
import type { Env } from "@/env";
import { AiQualityError } from "@/shared/errors";
import {
  type TripPlanOutput,
  tripPlanOutputSchema,
} from "@/shared/validation-schema/ai-output";

type GenerateOptions<T> = {
  env: Env;
  endpoint: string;
  promptVersion?: string;
  userId?: string;
  schema: ZodSchema<T>;
  system: string;
  prompt: string;
  maxOutputTokens: number;
  temperature: number;
};

type TripPlanQualityOptions = Omit<
  GenerateOptions<TripPlanOutput>,
  "schema"
> & {
  promptVersion: string;
  expectedDays?: number | null;
};

export async function generate<T>(opts: GenerateOptions<T>): Promise<T> {
  const start = Date.now();
  try {
    const { object, usage } = await generateObject({
      model: buildAiModel(opts.env),
      providerOptions: NO_THINKING,
      schema: opts.schema,
      system: opts.system,
      prompt: opts.prompt,
      maxOutputTokens: opts.maxOutputTokens,
      temperature: opts.temperature,
    });
    logAiCall({
      correlationId: crypto.randomUUID(),
      endpoint: opts.endpoint,
      promptVersion: opts.promptVersion,
      model: opts.env.GEMINI_MODEL,
      userId: opts.userId,
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      latencyMs: Date.now() - start,
      success: true,
      zodValid: true,
    });
    return object;
  } catch (err) {
    logAiCall({
      correlationId: crypto.randomUUID(),
      endpoint: opts.endpoint,
      promptVersion: opts.promptVersion,
      model: opts.env.GEMINI_MODEL,
      userId: opts.userId,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start,
      success: false,
      zodValid: false,
      errorCode: err instanceof Error ? err.message.slice(0, 120) : "unknown",
    });
    throw err;
  }
}

export async function generateTripPlanWithQuality(
  opts: TripPlanQualityOptions,
): Promise<TripPlanOutput> {
  let prompt = opts.prompt;
  let lastQualityError: AiQualityError | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await generate({
      ...opts,
      schema: tripPlanOutputSchema,
      prompt,
    });

    try {
      assertTripPlanQuality(result, { expectedDays: opts.expectedDays });
      return result;
    } catch (err) {
      if (!(err instanceof AiQualityError) || attempt === 2) throw err;
      lastQualityError = err;
      prompt =
        `${opts.prompt}\n\n` +
        `QUALITY CORRECTION REQUIRED:\n` +
        `The previous JSON failed these checks: ${err.issues.join("; ")}.\n` +
        `Regenerate the complete trip plan JSON. Every day must include ` +
        `a non-empty city and a specific lodging value with accommodation ` +
        `type plus neighbourhood or area.` +
        (opts.expectedDays
          ? ` The days array must contain exactly ${opts.expectedDays} objects.`
          : "");
    }
  }

  throw lastQualityError ?? new AiQualityError(["unknown quality failure"]);
}
