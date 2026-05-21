import type { Env } from "@/env";

import { createSearchPlaceTool } from "./search-place.tool";

export function buildTripGenerationTools(env: Env) {
  if (!env.GOOGLE_PLACES_API_KEY) return undefined;

  return {
    searchPlace: createSearchPlaceTool(env),
  };
}
