import type { Env } from "@/env";
import type { ResolvedPlace, RouteModeSummary } from "@/shared/validation-schema/ai-output";

const GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const DEFAULT_TIMEOUT_MS = 4_000;

export type RouteTravelMode = "walking" | "driving" | "transit";

export type RouteRequest = {
  origin: ResolvedPlace;
  destination: ResolvedPlace;
  mode: RouteTravelMode;
};

type GoogleRouteResponse = {
  routes?: Array<{
    duration?: string;
    distanceMeters?: number;
  }>;
};

export class GoogleRoutesClient {
  constructor(
    private readonly env: Pick<
      Env,
      "GOOGLE_DIRECTIONS_API_KEY" | "GOOGLE_PLACES_API_KEY"
    >,
    private readonly opts: { timeoutMs?: number } = {},
  ) {}

  async computeRoute(request: RouteRequest): Promise<RouteModeSummary | null> {
    const key = this.env.GOOGLE_DIRECTIONS_API_KEY ?? this.env.GOOGLE_PLACES_API_KEY;
    if (!key) return null;

    const origin = placeToWaypoint(request.origin);
    const destination = placeToWaypoint(request.destination);
    if (!origin || !destination) return null;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    try {
      const response = await fetch(GOOGLE_ROUTES_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
        },
        body: JSON.stringify({
          origin,
          destination,
          travelMode: mapTravelMode(request.mode),
          computeAlternativeRoutes: false,
        }),
      });
      if (!response.ok) return null;

      const data = (await response.json()) as GoogleRouteResponse;
      const route = data.routes?.[0];
      if (!route?.duration) return null;

      return {
        durationMinutes: Math.max(1, Math.round(parseDurationSeconds(route.duration) / 60)),
        distanceMeters: route.distanceMeters,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

const placeToWaypoint = (
  place: ResolvedPlace,
): { placeId: string } | { location: { latLng: { latitude: number; longitude: number } } } | null => {
  if (place.placeId) return { placeId: place.placeId };
  if (place.location) {
    return {
      location: {
        latLng: {
          latitude: place.location.lat,
          longitude: place.location.lng,
        },
      },
    };
  }
  return null;
};

const mapTravelMode = (mode: RouteTravelMode): string => {
  if (mode === "walking") return "WALK";
  if (mode === "transit") return "TRANSIT";
  return "DRIVE";
};

const parseDurationSeconds = (duration: string): number => {
  const seconds = Number(duration.replace(/s$/, ""));
  return Number.isFinite(seconds) ? seconds : 0;
};
