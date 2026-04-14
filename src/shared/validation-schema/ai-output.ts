import { z } from "zod";

// ─── Checklist ────────────────────────────────────────────────────────────────

export const aiQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["single", "multi", "text", "number", "date-range"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export const checklistOutputSchema = z.object({
  questions: z.array(aiQuestionSchema).min(1),
});

export type ChecklistOutput = z.infer<typeof checklistOutputSchema>;

// ─── Trip plan ────────────────────────────────────────────────────────────────

const tripAttractionSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  price: z.object({ amount: z.number(), currency: z.string() }).optional(),
  averageMinutesSpent: z.number().optional(),
  openingHours: z.string().optional(),
  websiteUrl: z.string().optional(),
});

const tripDayMealSchema = z.object({
  name: z.string(),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  notes: z.string().optional(),
});

const tripTransportLegSchema = z.object({
  from: z.string(),
  to: z.string(),
  mode: z.string(),
  durationMinutes: z.number().optional(),
  notes: z.string().optional(),
});

const tripDayPlanSchema = z.object({
  dayNumber: z.number(),
  dayTitle: z.string().optional(),
  city: z.string(),
  country: z.string().optional(),
  region: z.string().optional(),
  summary: z.string().optional(),
  attractions: z.array(tripAttractionSchema),
  meals: z.array(tripDayMealSchema).optional(),
  transportation: z.array(tripTransportLegSchema).optional(),
  lodging: z.string().optional(),
});

const paidAttractionSchema = z.object({
  name: z.string(),
  category: z.string(),
  estimatedPriceUsd: z.string(),
  notes: z.string().optional(),
});

const weatherOverviewSchema = z.object({
  bestMonth: z.string(),
  summary: z.string(),
  temperatureRangeCelsius: z.string(),
});

export const tripPlanOutputSchema = z.object({
  destination: z.string(),
  country: z.string(),
  bestTravelMonth: z.string().optional(),
  weather: weatherOverviewSchema,
  days: z.array(tripDayPlanSchema).min(1),
  paidAttractions: z.array(paidAttractionSchema),
  meta: z.record(z.unknown()).optional(),
});

export type TripPlanOutput = z.infer<typeof tripPlanOutputSchema>;

// ─── Hotel enrichment ─────────────────────────────────────────────────────────

export const hotelEnrichOutputSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  starRating: z.number().min(1).max(5).optional(),
  priceRangePerNightUsd: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type HotelEnrichOutput = z.infer<typeof hotelEnrichOutputSchema>;
