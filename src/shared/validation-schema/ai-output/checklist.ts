import { z } from "zod";

export const aiQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["single", "multi", "text", "number", "date-range"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export type AiQuestion = z.infer<typeof aiQuestionSchema>;

export const checklistOutputSchema = z.object({
  questions: z.array(aiQuestionSchema).min(1),
});

export type ChecklistOutput = z.infer<typeof checklistOutputSchema>;
