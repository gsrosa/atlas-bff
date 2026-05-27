import { z } from "zod";

export const placeResolveRequestSchema = z.object({
  kind: z.enum(["restaurant", "attraction", "lodging", "activity_provider"]),
  priority: z.enum(["required", "nice_to_have"]),
  query: z.string(),
  slot: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  city: z.string(),
  country: z.string().optional(),
  area: z.string().optional(),
  nearSlotId: z.string().optional(),
  nearText: z.string().optional(),
  cuisineHints: z.array(z.string()).optional(),
  budgetHint: z.enum(["budget", "moderate", "comfort", "luxury"]).optional(),
  allowUnresolved: z.boolean(),
});

export type PlaceResolveRequest = z.infer<typeof placeResolveRequestSchema>;

export const resolvedPlaceSchema = z.object({
  source: z.literal("google_places"),
  placeId: z.string(),
  name: z.string(),
  address: z.string().optional(),
  rating: z.number().optional(),
  userRatingsTotal: z.number().optional(),
  priceLevel: z.number().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  mapsUrl: z.string().optional(),
});

export type ResolvedPlace = z.infer<typeof resolvedPlaceSchema>;
