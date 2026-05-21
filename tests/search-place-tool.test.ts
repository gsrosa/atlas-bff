import { afterEach, describe, expect, it, vi } from "vitest";

import { createSearchPlaceTool } from "@/ai/tools/search-place.tool";

import { buildTestEnv } from "./helpers/test-env";

describe("createSearchPlaceTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns no results when Google Places is not configured", async () => {
    const tool = createSearchPlaceTool(buildTestEnv());

    await expect(
      tool.execute({ query: "Senso-ji", city: "Tokyo", country: "Japan" }),
    ).resolves.toEqual([]);
  });

  it("maps Google Places text search results", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          places: [
            {
              displayName: { text: "Senso-ji" },
              formattedAddress: "2 Chome-3-1 Asakusa, Taito City, Tokyo",
              priceLevel: "PRICE_LEVEL_FREE",
              regularOpeningHours: {
                weekdayDescriptions: ["Monday: Open 24 hours"],
              },
              websiteUri: "https://www.senso-ji.jp/",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const tool = createSearchPlaceTool(
      buildTestEnv({ GOOGLE_PLACES_API_KEY: "places-key" }),
    );

    await expect(
      tool.execute({ query: "Senso-ji", city: "Tokyo", country: "Japan" }),
    ).resolves.toEqual([
      {
        name: "Senso-ji",
        address: "2 Chome-3-1 Asakusa, Taito City, Tokyo",
        priceLevel: "PRICE_LEVEL_FREE",
        openingHours: "Monday: Open 24 hours",
        websiteUrl: "https://www.senso-ji.jp/",
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
});
