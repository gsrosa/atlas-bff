import { z } from "zod";

/** One bookable / visitable point of interest (AI + optional user edits). */
export const aiAttractionSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  price: z
    .object({
      amount: z.number(),
      currency: z.string().default("USD"),
    })
    .optional(),
  /** Typical visit duration in minutes (AI estimate). */
  averageMinutesSpent: z.number().int().positive().optional(),
  openingHours: z.string().optional(),
  websiteUrl: z.string().url().optional(),
});

export type AiAttraction = z.infer<typeof aiAttractionSchema>;

export const aiMealSlotSchema = z.object({
  name: z.string(),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  notes: z.string().optional(),
});

export type AiMealSlot = z.infer<typeof aiMealSlotSchema>;

export const aiTransportLegSchema = z.object({
  from: z.string(),
  to: z.string(),
  mode: z.string(),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type AiTransportLeg = z.infer<typeof aiTransportLegSchema>;

export const aiWeatherOverviewSchema = z.object({
  bestMonth: z.string(),
  summary: z.string(),
  temperatureRangeCelsius: z.string(),
});

export type AiWeatherOverview = z.infer<typeof aiWeatherOverviewSchema>;
