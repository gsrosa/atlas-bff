import { afterEach, describe, expect, it, vi } from "vitest";

import { createWeatherForecastTool } from "@/ai/tools/weather-forecast.tool";

describe("createWeatherForecastTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("geocodes destination and maps Open-Meteo daily forecast", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                name: "Tokyo",
                country: "Japan",
                latitude: 35.6895,
                longitude: 139.6917,
                timezone: "Asia/Tokyo",
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            daily: {
              time: ["2026-06-01"],
              weather_code: [3],
              temperature_2m_max: [25.4],
              temperature_2m_min: [18.1],
              precipitation_sum: [1.2],
              precipitation_probability_max: [40],
            },
          }),
          { status: 200 },
        ),
      );

    const tool = createWeatherForecastTool();

    await expect(
      tool.execute({
        destination: "Tokyo",
        country: "Japan",
        startDate: "2026-06-01",
        endDate: "2026-06-01",
      }),
    ).resolves.toEqual({
      location: "Tokyo",
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
      timezone: "Asia/Tokyo",
      days: [
        {
          date: "2026-06-01",
          weatherCode: 3,
          temperatureMaxC: 25.4,
          temperatureMinC: 18.1,
          precipitationMm: 1.2,
          precipitationProbabilityMaxPct: 40,
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
