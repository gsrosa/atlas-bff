import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

import type { Env } from "@/env/env";
import type { StreamAiInput } from "@/shared/validation-schema/ai-stream";

export async function streamGeminiText(
  env: Env,
  input: StreamAiInput,
): Promise<ReturnType<typeof streamText>> {
  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY! });
  const model = input.model ?? env.GEMINI_MODEL;

  return streamText({
    model: google(model),
    system: input.systemPrompt,
    prompt: input.userPrompt,
    maxOutputTokens: input.maxOutputTokens ?? 8192,
    temperature: input.temperature ?? 0.7,
  });
}
