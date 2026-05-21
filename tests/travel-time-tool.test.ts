import { afterEach, describe, expect, it, vi } from "vitest";

import { createTravelTimeTool } from "@/ai/tools/travel-time.tool";

import { buildTestEnv } from "./helpers/test-env";

describe("createTravelTimeTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps Google Directions duration and distance", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "OK",
          routes: [
            {
              summary: "Av. Paulista",
              legs: [
                {
                  distance: { value: 3200, text: "3.2 km" },
                  duration: { value: 900, text: "15 mins" },
                  duration_in_traffic: { value: 1020, text: "17 mins" },
                },
              ],
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const tool = createTravelTimeTool(
      buildTestEnv({ GOOGLE_DIRECTIONS_API_KEY: "directions-key" }),
    );

    await expect(
      tool.execute({
        origin: "MASP, Sao Paulo",
        destination: "Ibirapuera Park, Sao Paulo",
        mode: "driving",
      }),
    ).resolves.toEqual({
      origin: "MASP, Sao Paulo",
      destination: "Ibirapuera Park, Sao Paulo",
      mode: "driving",
      durationMinutes: 17,
      durationText: "17 mins",
      distanceMeters: 3200,
      distanceText: "3.2 km",
      routeSummary: "Av. Paulista",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://maps.googleapis.com/maps/api/directions/json?"),
    );
  });
});
