import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed } from "ai";

import type { Env } from "@/env";

export const DESTINATION_EMBEDDING_MODEL = "text-embedding-004";
export const DESTINATION_EMBEDDING_DIMENSIONS = 768;

export async function embedText(env: Env, text: string): Promise<number[]> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required to embed destination context");
  }

  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
  const result = await embed({
    model: google.embedding(DESTINATION_EMBEDDING_MODEL),
    value: text,
  });

  if (result.embedding.length !== DESTINATION_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${DESTINATION_EMBEDDING_DIMENSIONS} embedding dimensions, got ${result.embedding.length}`,
    );
  }

  return result.embedding;
}
