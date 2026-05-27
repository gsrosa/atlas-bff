import { z } from "zod";

import { tripAdviceSchema } from "./advice";
import {
  aiAttractionSchema,
  aiMealSlotSchema,
  aiTransportLegSchema,
  aiWeatherOverviewSchema,
} from "./base";
import { dayMapRouteSchema, itinerarySlotSchema } from "./slot";

/** One calendar day of the trip; city is explicit for multi-city routes. */
export const aiDayItinerarySchema = z.object({
  dayNumber: z.number().int().positive(),
  dayTitle: z.string().optional(),
  city: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  summary: z.string().optional(),
  slots: z.array(itinerarySlotSchema).optional(),
  mapRoute: dayMapRouteSchema.optional(),
  attractions: z.array(aiAttractionSchema).default([]),
  meals: z.array(aiMealSlotSchema).optional(),
  transportation: z.array(aiTransportLegSchema).optional(),
  lodging: z.string().optional(),
});

export type AiDayItinerary = z.infer<typeof aiDayItinerarySchema>;

export const placeResolveStatsSchema = z.object({
  requested: z.number().int().nonnegative().optional(),
  resolved: z.number().int().nonnegative().optional(),
  unresolved: z.number().int().nonnegative().optional(),
  failed: z.number().int().nonnegative().optional(),
});

export type PlaceResolveStats = z.infer<typeof placeResolveStatsSchema>;

export const tripItineraryMetaSchema = z
  .object({
    placeResolveStats: placeResolveStatsSchema.optional(),
  })
  .catchall(z.unknown());

export type TripItineraryMeta = z.infer<typeof tripItineraryMetaSchema>;

export const paidAttractionSchema = z.object({
  name: z.string(),
  category: z.string(),
  estimatedPriceUsd: z.string(),
  notes: z.string().optional(),
});

export type PaidAttraction = z.infer<typeof paidAttractionSchema>;

/** Full structured output stored in trip_plans.itinerary (validated at API boundary). */
export const tripItineraryDocumentSchema = z.object({
  destination: z.string(),
  country: z.string(),
  bestTravelMonth: z.string().optional(),
  weather: aiWeatherOverviewSchema.optional(),
  days: z.array(aiDayItinerarySchema),
  paidAttractions: z.array(paidAttractionSchema).optional(),
  tripAdvice: tripAdviceSchema.optional(),
  /** Extra AI fields (links, maps, disclaimers) without schema churn. */
  meta: tripItineraryMetaSchema.optional(),
});

export type TripItineraryDocument = z.infer<typeof tripItineraryDocumentSchema>;
