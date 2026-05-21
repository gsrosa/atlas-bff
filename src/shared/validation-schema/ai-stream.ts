import { z } from "zod";

/** Used by POST /plans/stream — raw SSE, systemPrompt is server-validated. */
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

/**
 * Used by POST /plans/edit — no systemPrompt accepted from client.
 * System prompt is built server-side only.
 */
export const editTripPlanInputSchema = z.object({
  userPrompt: z.string().min(1).max(100_000),
  maxOutputTokens: z.coerce.number().int().positive().max(32768).optional(),
  temperature: z.coerce.number().min(0).max(2).optional(),
});

export type EditTripPlanInput = z.infer<typeof editTripPlanInputSchema>;
