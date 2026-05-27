import type { Env } from "@/env";

const GOOGLE_PLACES_TEXT_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchText";

const GOOGLE_PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.googleMapsUri",
  "places.websiteUri",
].join(",");

const DEFAULT_TIMEOUT_MS = 4_000;
const DEFAULT_PAGE_SIZE = 5;

export type GooglePlaceCandidate = {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  location?: {
    lat: number;
    lng: number;
  };
  mapsUrl?: string;
  websiteUrl?: string;
};

export type GooglePlacesSearchOptions = {
  city?: string;
  country?: string;
  pageSize?: number;
  locationBias?: {
    lat: number;
    lng: number;
    radiusMeters?: number;
  };
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  googleMapsUri?: string;
  websiteUri?: string;
};

type GooglePlacesSearchResponse = {
  places?: GooglePlace[];
};

export class GooglePlacesClient {
  constructor(
    private readonly env: Pick<Env, "GOOGLE_PLACES_API_KEY">,
    private readonly opts: { timeoutMs?: number } = {},
  ) {}

  async searchText(
    query: string,
    options: GooglePlacesSearchOptions = {},
  ): Promise<GooglePlaceCandidate[]> {
    if (!this.env.GOOGLE_PLACES_API_KEY) return [];

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    try {
      const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
        },
        body: JSON.stringify(buildRequestBody(query, options)),
      });

      if (!response.ok) return [];

      const data = (await response.json()) as GooglePlacesSearchResponse;
      return (data.places ?? []).flatMap(mapGooglePlace);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}

const buildRequestBody = (
  query: string,
  options: GooglePlacesSearchOptions,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    textQuery: [query, options.city, options.country].filter(Boolean).join(", "),
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  if (options.locationBias) {
    body.locationBias = {
      circle: {
        center: {
          latitude: options.locationBias.lat,
          longitude: options.locationBias.lng,
        },
        radius: options.locationBias.radiusMeters ?? 1_500,
      },
    };
  }

  return body;
};

const mapGooglePlace = (place: GooglePlace): GooglePlaceCandidate[] => {
  const placeId = place.id;
  const name = place.displayName?.text;
  if (!placeId || !name) return [];

  return [
    {
      placeId,
      name,
      address: place.formattedAddress,
      rating: place.rating,
      userRatingsTotal: place.userRatingCount,
      priceLevel: mapPriceLevel(place.priceLevel),
      location:
        place.location?.latitude !== undefined &&
        place.location.longitude !== undefined
          ? {
              lat: place.location.latitude,
              lng: place.location.longitude,
            }
          : undefined,
      mapsUrl: place.googleMapsUri,
      websiteUrl: place.websiteUri,
    },
  ];
};

const mapPriceLevel = (priceLevel: string | undefined): number | undefined => {
  if (!priceLevel) return undefined;
  const match = priceLevel.match(/PRICE_LEVEL_(\d+)/);
  if (match?.[1]) return Number(match[1]);

  const named: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return named[priceLevel];
};
