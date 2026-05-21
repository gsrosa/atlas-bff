import { z } from "zod";

const planAttractionInputSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  price: z.object({ amount: z.number(), currency: z.string() }).optional(),
  averageMinutesSpent: z.number().optional(),
  openingHours: z.string().optional(),
  websiteUrl: z.string().optional(),
});

const planDayInputSchema = z.object({
  dayNumber: z.number(),
  dayTitle: z.string().optional(),
  city: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  summary: z.string().optional(),
  attractions: z.array(planAttractionInputSchema),
  meals: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        notes: z.string().optional(),
      }),
    )
    .optional(),
  transportation: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        mode: z.string(),
        durationMinutes: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
  lodging: z.string().optional(),
});

export type PlanModificationOperation =
  | { type: "updateDayLodging"; dayNumbers: number[]; lodging: string }
  | {
      type: "addAttraction";
      dayNumber: number;
      attraction: z.infer<typeof planAttractionInputSchema>;
    }
  | {
      type: "replaceDay";
      dayNumber: number;
      day: z.infer<typeof planDayInputSchema>;
    };

export function buildPlanModificationTools(
  operations: PlanModificationOperation[],
) {
  return {
    updateDayLodging: {
      description: "Update only the lodging field for one or more existing days.",
      inputSchema: z.object({
        dayNumbers: z.array(z.number().int().positive()).min(1),
        lodging: z.string().min(3).max(500),
      }),
      execute: async (input: { dayNumbers: number[]; lodging: string }) => {
        const operation: PlanModificationOperation = {
          type: "updateDayLodging",
          ...input,
        };
        operations.push(operation);
        return operation;
      },
    },
    addAttraction: {
      description: "Append one attraction to an existing day.",
      inputSchema: z.object({
        dayNumber: z.number().int().positive(),
        attraction: planAttractionInputSchema,
      }),
      execute: async (input: {
        dayNumber: number;
        attraction: z.infer<typeof planAttractionInputSchema>;
      }) => {
        const operation: PlanModificationOperation = {
          type: "addAttraction",
          ...input,
        };
        operations.push(operation);
        return operation;
      },
    },
    replaceDay: {
      description: "Replace one complete day only when rebuilding is required.",
      inputSchema: z.object({
        dayNumber: z.number().int().positive(),
        day: planDayInputSchema,
      }),
      execute: async (input: {
        dayNumber: number;
        day: z.infer<typeof planDayInputSchema>;
      }) => {
        const operation: PlanModificationOperation = {
          type: "replaceDay",
          ...input,
        };
        operations.push(operation);
        return operation;
      },
    },
  };
}
