import { z } from "zod";

import type { Env } from "@/env";

const GOOGLE_PLACES_TEXT_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchText";

const GOOGLE_PLACES_FIELD_MASK = [
  "places.displayName",
  "places.formattedAddress",
  "places.priceLevel",
  "places.regularOpeningHours",
  "places.websiteUri",
].join(",");

const searchPlaceInputSchema = z.object({
  query: z
    .string()
    .min(2)
    .max(300)
    .describe("Place name plus city or destination context."),
  city: z.string().min(1).max(120).optional(),
  country: z.string().min(1).max(120).optional(),
});

interface GooglePlace {
  displayName?: { text?: string };
  formattedAddress?: string;
  priceLevel?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  websiteUri?: string;
}

interface GooglePlacesSearchResponse {
  places?: GooglePlace[];
}

export interface SearchPlaceResult {
  name: string;
  address?: string;
  priceLevel?: string;
  openingHours?: string;
  websiteUrl?: string;
}

export function createSearchPlaceTool(env: Env) {
  return {
    description:
      "Search Google Places for a real attraction, restaurant, hotel, or landmark. Use this to verify names, full street addresses, opening hours, prices, and websites before adding places to a trip plan.",
    inputSchema: searchPlaceInputSchema,
    execute: async ({
      query,
      city,
      country,
    }: z.infer<typeof searchPlaceInputSchema>): Promise<SearchPlaceResult[]> => {
      if (!env.GOOGLE_PLACES_API_KEY) return [];

      const textQuery = [query, city, country].filter(Boolean).join(", ");
      const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery,
          pageSize: 3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Places search failed: ${response.status}`);
      }

      const data = (await response.json()) as GooglePlacesSearchResponse;
      return (data.places ?? []).map((place) => ({
        name: place.displayName?.text ?? query,
        address: place.formattedAddress,
        priceLevel: place.priceLevel,
        openingHours: place.regularOpeningHours?.weekdayDescriptions?.join("; "),
        websiteUrl: place.websiteUri,
      }));
    },
  };
}
