import { streamText } from "ai";

import { buildAiModel, buildAiModelWithName } from "@/ai/client";
import type { Env } from "@/env";
import type { StreamAiInput } from "@/shared/validation-schema/ai-stream";

export async function streamGeminiText(
  env: Env,
  input: StreamAiInput,
): Promise<ReturnType<typeof streamText>> {
  const model = input.model
    ? buildAiModelWithName(env, input.model)
    : buildAiModel(env);

  return streamText({
    model,
    system: input.systemPrompt,
    prompt: input.userPrompt,
    maxOutputTokens: input.maxOutputTokens ?? 8192,
    temperature: input.temperature ?? 0.7,
  });
}
