import { z } from "zod";

export const editTripPlanInputSchema = z.object({
  userPrompt: z.string().min(1).max(100_000),
  maxOutputTokens: z.coerce.number().int().positive().max(32768).optional(),
  temperature: z.coerce.number().min(0).max(2).optional(),
});

export type EditTripPlanInput = z.infer<typeof editTripPlanInputSchema>;
