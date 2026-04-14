import { z } from "zod";

const answerValueSchema = z.union([z.string(), z.array(z.string())]);
export const answerMapSchema = z.record(answerValueSchema);

export const checklistInputSchema = z.object({
  answers: answerMapSchema,
});

export const aiQuestionInputSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["single", "multi", "text", "number", "date-range"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export const tripPlanInputSchema = z.object({
  answers: answerMapSchema,
  aiQuestions: z.array(aiQuestionInputSchema),
  aiAnswers: answerMapSchema,
});

export type AnswerMap = z.infer<typeof answerMapSchema>;
export type ChecklistInput = z.infer<typeof checklistInputSchema>;
export type TripPlanInput = z.infer<typeof tripPlanInputSchema>;
export type AiQuestionInput = z.infer<typeof aiQuestionInputSchema>;
