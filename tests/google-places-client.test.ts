import { afterEach, describe, expect, it, vi } from "vitest";

import { GooglePlacesClient } from "@/services/places/google-places.client";

import { buildTestEnv } from "./helpers/test-env";

describe("GooglePlacesClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns no candidates when the API key is missing", async () => {
    const client = new GooglePlacesClient(buildTestEnv());

    await expect(client.searchText("ramen near Ueno")).resolves.toEqual([]);
  });

  it("maps compact Google Places candidates", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          places: [
            {
              id: "places/ueno-ramen",
              displayName: { text: "Ueno Ramen" },
              formattedAddress: "1-1 Ueno, Tokyo",
              location: { latitude: 35.71, longitude: 139.77 },
              rating: 4.6,
              userRatingCount: 1200,
              priceLevel: "PRICE_LEVEL_MODERATE",
              googleMapsUri: "https://maps.google.com/ueno-ramen",
              websiteUri: "https://example.com",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const client = new GooglePlacesClient(
      buildTestEnv({ GOOGLE_PLACES_API_KEY: "places-key" }),
    );

    await expect(
      client.searchText("ramen", {
        city: "Tokyo",
        country: "Japan",
        locationBias: { lat: 35.7, lng: 139.7 },
      }),
    ).resolves.toEqual([
      {
        placeId: "places/ueno-ramen",
        name: "Ueno Ramen",
        address: "1-1 Ueno, Tokyo",
        location: { lat: 35.71, lng: 139.77 },
        mapsUrl: "https://maps.google.com/ueno-ramen",
        priceLevel: 2,
        rating: 4.6,
        userRatingsTotal: 1200,
        websiteUrl: "https://example.com",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchText",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Goog-Api-Key": "places-key",
        }),
      }),
    );
  });

  it("normalizes failed Google responses to no candidates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("bad", { status: 500 }),
    );
    const client = new GooglePlacesClient(
      buildTestEnv({ GOOGLE_PLACES_API_KEY: "places-key" }),
    );

    await expect(client.searchText("ramen")).resolves.toEqual([]);
  });

  it("caches repeated text searches", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          places: [{ id: "a", displayName: { text: "A" } }],
        }),
        { status: 200 },
      ),
    );
    const client = new GooglePlacesClient(
      buildTestEnv({ GOOGLE_PLACES_API_KEY: "places-key" }),
    );

    await client.searchText("A", { city: "Tokyo" });
    await client.searchText("A", { city: "Tokyo" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
