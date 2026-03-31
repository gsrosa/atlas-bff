import { z } from "zod";

export const createTripPlanInputSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  aiSuggestedTitle: z.string().min(1).max(500).optional(),
  departureAt: z.string().min(1).optional(),
  arrivalAt: z.string().min(1).optional(),
  flightNumbers: z.array(z.string().max(32)).max(40).default([]),
  daysCount: z.number().int().positive().max(366).optional(),
  destination: z.string().min(1).max(500).optional(),
  destinationCountry: z.string().length(2).optional(),
  formSnapshot: z.record(z.string(), z.unknown()).default({}),
  itinerary: z.record(z.string(), z.unknown()).default({}),
});

export const patchTripPlanInputSchema = createTripPlanInputSchema.partial();

export const listTripPlansInputSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(50),
});

export const tripPlanIdInputSchema = z.object({
  id: z.string().uuid(),
});
