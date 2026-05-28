import { z } from "zod";

import { dayMapRouteSchema, itinerarySlotSchema } from "./slot";
import { tripAdviceSchema } from "./trip-advice";

export const tripAttractionSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  price: z.object({ amount: z.number(), currency: z.string() }).optional(),
  averageMinutesSpent: z.number().optional(),
  openingHours: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export type TripAttraction = z.infer<typeof tripAttractionSchema>;

export const tripDayMealSchema = z.object({
  name: z.string(),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  notes: z.string().optional(),
});

export type TripDayMeal = z.infer<typeof tripDayMealSchema>;

export const tripTransportLegSchema = z.object({
  from: z.string(),
  to: z.string(),
  mode: z.string(),
  durationMinutes: z.number().optional(),
  notes: z.string().optional(),
});

export type TripTransportLeg = z.infer<typeof tripTransportLegSchema>;

export const tripDayPlanSchema = z.object({
  dayNumber: z.number(),
  dayTitle: z.string().optional(),
  city: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  summary: z.string().optional(),
  slots: z.array(itinerarySlotSchema).optional(),
  mapRoute: dayMapRouteSchema.optional(),
  attractions: z.array(tripAttractionSchema),
  meals: z.array(tripDayMealSchema).optional(),
  transportation: z.array(tripTransportLegSchema).optional(),
  lodging: z.string().optional(),
});

export type TripDayPlan = z.infer<typeof tripDayPlanSchema>;

export const paidAttractionSchema = z.object({
  name: z.string(),
  category: z.string(),
  estimatedPriceUsd: z.string(),
  notes: z.string().optional(),
});

export type PaidAttraction = z.infer<typeof paidAttractionSchema>;

export const weatherOverviewSchema = z.object({
  bestMonth: z.string(),
  summary: z.string(),
  temperatureRangeCelsius: z.string(),
});

export type WeatherOverview = z.infer<typeof weatherOverviewSchema>;

export const placeResolveStatsSchema = z.object({
  requested: z.number().optional(),
  resolved: z.number().optional(),
  unresolved: z.number().optional(),
  failed: z.number().optional(),
});

export type PlaceResolveStats = z.infer<typeof placeResolveStatsSchema>;

export const tripPlanMetaSchema = z
  .object({
    placeResolveStats: placeResolveStatsSchema.optional(),
  })
  .catchall(z.unknown());

export type TripPlanMeta = z.infer<typeof tripPlanMetaSchema>;

export const tripPlanOutputSchema = z.object({
  title: z.string().optional(),
  destination: z.string(),
  country: z.string(),
  bestTravelMonth: z.string().optional(),
  weather: weatherOverviewSchema,
  days: z.array(tripDayPlanSchema).min(1),
  paidAttractions: z.array(paidAttractionSchema),
  tripAdvice: tripAdviceSchema.optional(),
  meta: tripPlanMetaSchema.optional(),
});

export type TripPlanOutput = z.infer<typeof tripPlanOutputSchema>;
