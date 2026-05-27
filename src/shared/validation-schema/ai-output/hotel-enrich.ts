import { z } from "zod";

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
