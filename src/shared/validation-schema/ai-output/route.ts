import { z } from "zod";

export const routeModeSummarySchema = z.object({
  durationMinutes: z.number(),
  distanceMeters: z.number().optional(),
  mapsUrl: z.string().optional(),
});

export type RouteModeSummary = z.infer<typeof routeModeSummarySchema>;

export const routeLegSummarySchema = z.object({
  fromSlotId: z.string(),
  toSlotId: z.string(),
  modes: z.object({
    walking: routeModeSummarySchema.optional(),
    driving: routeModeSummarySchema.optional(),
    transit: routeModeSummarySchema.optional(),
  }),
  recommendedMode: z.enum(["walking", "driving", "transit"]).optional(),
  notes: z.string().optional(),
});

export type RouteLegSummary = z.infer<typeof routeLegSummarySchema>;
