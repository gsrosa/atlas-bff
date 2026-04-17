import { z } from "zod";

import { flightEntrySchema } from "@/shared/validation-schema/trip-plans";

const answerValueSchema = z.union([z.string(), z.array(z.string())]);
export const answerMapSchema = z.record(answerValueSchema);

export const aiQuestionInputSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["single", "multi", "text", "number", "date-range"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

const hotelEntrySchema = z.object({
  name: z.string().max(500),
  address: z.string().max(500).optional(),
  checkinDate: z.string().optional(),
  checkoutDate: z.string().optional(),
});

const tripDetailsSchema = z.object({
  hotels: z.array(hotelEntrySchema).max(20).optional(),
  flights: z.array(flightEntrySchema).max(20).optional(),
}).optional();

export const checklistInputSchema = z.object({
  answers: answerMapSchema,
  tripDetails: tripDetailsSchema,
});

export const tripPlanInputSchema = z.object({
  answers: answerMapSchema,
  aiQuestions: z.array(aiQuestionInputSchema),
  aiAnswers: answerMapSchema,
  tripDetails: tripDetailsSchema,
});

export type AnswerMap = z.infer<typeof answerMapSchema>;
export type ChecklistInput = z.infer<typeof checklistInputSchema>;
export type TripPlanInput = z.infer<typeof tripPlanInputSchema>;
export type AiQuestionInput = z.infer<typeof aiQuestionInputSchema>;
export type TripDetails = z.infer<typeof tripDetailsSchema>;
