import { z } from "zod";

import type { Env } from "@/env";

const GOOGLE_DIRECTIONS_URL =
  "https://maps.googleapis.com/maps/api/directions/json";

const travelTimeInputSchema = z.object({
  origin: z.string().min(2).max(300),
  destination: z.string().min(2).max(300),
  mode: z.enum(["driving", "walking", "bicycling", "transit"]).default("driving"),
});

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes?: Array<{
    summary?: string;
    legs?: Array<{
      distance?: { value?: number; text?: string };
      duration?: { value?: number; text?: string };
      duration_in_traffic?: { value?: number; text?: string };
    }>;
  }>;
}

export interface TravelTimeResult {
  origin: string;
  destination: string;
  mode: "driving" | "walking" | "bicycling" | "transit";
  durationMinutes?: number;
  durationText?: string;
  distanceMeters?: number;
  distanceText?: string;
  routeSummary?: string;
}

export function createTravelTimeTool(env: Env) {
  return {
    description:
      "Estimate real travel time and distance between two places with Google Directions. Use this for itinerary transportation legs and route feasibility checks.",
    inputSchema: travelTimeInputSchema,
    execute: async ({
      origin,
      destination,
      mode,
    }: z.infer<typeof travelTimeInputSchema>): Promise<TravelTimeResult> => {
      const params = new URLSearchParams({
        origin,
        destination,
        mode,
        units: "metric",
        key: env.GOOGLE_DIRECTIONS_API_KEY!,
      });
      if (mode === "driving") {
        params.set("departure_time", "now");
      }

      const response = await fetch(`${GOOGLE_DIRECTIONS_URL}?${params}`);
      if (!response.ok) {
        throw new Error(`Google Directions request failed: ${response.status}`);
      }

      const data = (await response.json()) as GoogleDirectionsResponse;
      if (data.status !== "OK") {
        throw new Error(
          `Google Directions failed: ${data.error_message ?? data.status}`,
        );
      }

      const route = data.routes?.[0];
      const leg = route?.legs?.[0];
      const duration = leg?.duration_in_traffic ?? leg?.duration;

      return {
        origin,
        destination,
        mode,
        durationMinutes:
          duration?.value !== undefined
            ? Math.round(duration.value / 60)
            : undefined,
        durationText: duration?.text,
        distanceMeters: leg?.distance?.value,
        distanceText: leg?.distance?.text,
        routeSummary: route?.summary,
      };
    },
  };
}
