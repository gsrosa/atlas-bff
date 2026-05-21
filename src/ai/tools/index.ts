import type { Env } from "@/env";

import { createSearchPlaceTool } from "./search-place.tool";
import { createTravelTimeTool } from "./travel-time.tool";
import { createWeatherForecastTool } from "./weather-forecast.tool";

export function buildTripGenerationTools(env: Env) {
  return {
    getWeatherForecast: createWeatherForecastTool(),
    ...(env.GOOGLE_DIRECTIONS_API_KEY
      ? { estimateTravelTime: createTravelTimeTool(env) }
      : {}),
    ...(env.GOOGLE_PLACES_API_KEY
      ? { searchPlace: createSearchPlaceTool(env) }
      : {}),
  };
}
