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

export const aiTransportLegSchema = z.object({
  from: z.string(),
  to: z.string(),
  mode: z.string(),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

/** One calendar day of the trip; city is explicit for multi-city routes. */
export const aiDayItinerarySchema = z.object({
  dayNumber: z.number().int().positive(),
  dayTitle: z.string().optional(),
  city: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  summary: z.string().optional(),
  attractions: z.array(aiAttractionSchema).default([]),
  meals: z.array(aiMealSlotSchema).optional(),
  transportation: z.array(aiTransportLegSchema).optional(),
  lodging: z.string().optional(),
});

export type AiDayItinerary = z.infer<typeof aiDayItinerarySchema>;

export const aiWeatherOverviewSchema = z.object({
  bestMonth: z.string(),
  summary: z.string(),
  temperatureRangeCelsius: z.string(),
});

/** Full structured output stored in trip_plans.itinerary (validated at API boundary). */
export const tripItineraryDocumentSchema = z.object({
  destination: z.string(),
  country: z.string(),
  bestTravelMonth: z.string().optional(),
  weather: aiWeatherOverviewSchema.optional(),
  days: z.array(aiDayItinerarySchema),
  paidAttractions: z
    .array(
      z.object({
        name: z.string(),
        category: z.string(),
        estimatedPriceUsd: z.string(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
  /** Extra AI fields (links, maps, disclaimers) without schema churn. */
  meta: z.record(z.unknown()).optional(),
});

export type TripItineraryDocument = z.infer<typeof tripItineraryDocumentSchema>;
