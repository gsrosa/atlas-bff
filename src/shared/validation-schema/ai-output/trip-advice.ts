import { z } from "zod";

export const tripAdviceSchema = z.object({
  bestAreasToStay: z.array(
    z.object({
      area: z.string(),
      reason: z.string(),
      bestFor: z.array(z.string()).optional(),
    }),
  ),
  shouldSplitStay: z.boolean(),
  splitStayAdvice: z
    .object({
      summary: z.string(),
      suggestedMoves: z.array(
        z.object({
          fromDay: z.number(),
          toDay: z.number(),
          area: z.string(),
          reason: z.string(),
        }),
      ),
    })
    .optional(),
  transportAdvice: z.array(z.string()).optional(),
  safetyOrLogisticsAdvice: z.array(z.string()).optional(),
});

export type TripAdvice = z.infer<typeof tripAdviceSchema>;
