import type { Env } from "@/env";

import { createSearchPlaceTool } from "./search-place.tool";
import { createWeatherForecastTool } from "./weather-forecast.tool";

export function buildTripGenerationTools(env: Env) {
  return {
    getWeatherForecast: createWeatherForecastTool(),
    ...(env.GOOGLE_PLACES_API_KEY
      ? { searchPlace: createSearchPlaceTool(env) }
      : {}),
  };
}
