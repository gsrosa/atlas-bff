import { z } from "zod";

export const streamAiInputSchema = z.object({
  systemPrompt: z.string().max(100_000).optional(),
  userPrompt: z.string().min(1).max(100_000),
  /** Overrides server default when set. */
  model: z.string().min(1).max(120).optional(),
  maxOutputTokens: z.coerce.number().int().positive().max(8192).optional(),
  temperature: z.coerce.number().min(0).max(2).optional(),
  responseMimeType: z.enum(["text/plain", "application/json"]).optional(),
});

export type StreamAiInput = z.infer<typeof streamAiInputSchema>;
