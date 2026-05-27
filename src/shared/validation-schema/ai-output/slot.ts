import { z } from "zod";

import { placeResolveRequestSchema, resolvedPlaceSchema } from "./place";
import { routeLegSummarySchema } from "./route";

export const itinerarySlotSchema = z.object({
  id: z.string(),
  dayNumber: z.number(),
  startTime: z.string(),
  endTime: z.string().optional(),
  durationMinutes: z.number().optional(),
  kind: z.enum([
    "attraction",
    "meal",
    "transport",
    "activity",
    "lodging",
    "free_time",
  ]),
  title: z.string(),
  notes: z.string().optional(),
  area: z.string().optional(),
  city: z.string(),
  country: z.string().optional(),
  estimatedPrice: z
    .object({
      amount: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string(),
      label: z.string().optional(),
    })
    .optional(),
  resolve: placeResolveRequestSchema.optional(),
  resolvedPlace: resolvedPlaceSchema.optional(),
  routeFromPrevious: routeLegSummarySchema.optional(),
});

export type ItinerarySlot = z.infer<typeof itinerarySlotSchema>;

export const dayMapRouteSchema = z.object({
  dayNumber: z.number(),
  mapsUrl: z.string(),
  placeIds: z.array(z.string()),
  unresolvedStopTitles: z.array(z.string()),
});

export type DayMapRoute = z.infer<typeof dayMapRouteSchema>;
