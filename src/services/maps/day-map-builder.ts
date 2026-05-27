import type {
  DayMapRoute,
  ItinerarySlot,
  TripPlanOutput,
} from "@/shared/validation-schema/ai-output";

export const buildDayMapRoutes = (plan: TripPlanOutput): TripPlanOutput => ({
  ...plan,
  days: plan.days.map((day) => {
    if (!day.slots?.length) return day;
    return {
      ...day,
      mapRoute: buildDayMapRoute(day.dayNumber, day.slots),
    };
  }),
});

export const buildDayMapRoute = (
  dayNumber: number,
  slots: ItinerarySlot[],
): DayMapRoute | undefined => {
  const resolvedStops = slots.flatMap((slot) => {
    const place = slot.resolvedPlace;
    if (!place) return [];
    if (place.placeId) return [{ title: slot.title, token: `place_id:${place.placeId}` }];
    if (place.location) {
      return [
        {
          title: slot.title,
          token: `${place.location.lat},${place.location.lng}`,
        },
      ];
    }
    return [];
  });

  if (resolvedStops.length === 0) return undefined;

  const unresolvedStopTitles = slots
    .filter((slot) => isMapRelevant(slot) && !slot.resolvedPlace)
    .map((slot) => slot.title);

  return {
    dayNumber,
    mapsUrl: buildGoogleMapsUrl(resolvedStops.map((stop) => stop.token)),
    placeIds: resolvedStops
      .map((stop) => stop.token.replace(/^place_id:/, ""))
      .filter((token) => !token.includes(",")),
    unresolvedStopTitles,
  };
};

const buildGoogleMapsUrl = (tokens: string[]): string => {
  const encoded = tokens.map(encodeURIComponent);
  if (encoded.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encoded[0]}`;
  }

  const [origin, ...rest] = encoded;
  const destination = rest.at(-1);
  const waypoints = rest.slice(0, -1);

  return [
    "https://www.google.com/maps/dir/?api=1",
    `origin=${origin}`,
    `destination=${destination}`,
    waypoints.length > 0 ? `waypoints=${waypoints.join("%7C")}` : null,
  ]
    .filter(Boolean)
    .join("&");
};

const isMapRelevant = (slot: ItinerarySlot): boolean =>
  slot.kind === "attraction" ||
  slot.kind === "meal" ||
  slot.kind === "activity" ||
  slot.kind === "lodging";
