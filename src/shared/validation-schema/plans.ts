import { z } from "zod";

export const planStatusSchema = z.enum(["draft", "completed", "archived"]);

const payloadRecord = z.record(z.string(), z.unknown());

export const createPlanInputSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: planStatusSchema.default("draft"),
  payload: payloadRecord.default({}),
});

export const patchPlanInputSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: planStatusSchema.optional(),
  payload: payloadRecord.optional(),
});

export const listPlansInputSchema = z.object({
  status: planStatusSchema.optional(),
});

export const planIdInputSchema = z.object({
  id: z.string().uuid(),
});
