import type {
  ItinerarySlot,
  RouteLegSummary,
  TripPlanOutput,
} from "@/shared/validation-schema/ai-output";

import type { GoogleRoutesClient, RouteTravelMode } from "./google-routes.client";

const MODES: RouteTravelMode[] = ["walking", "driving", "transit"];
const MAX_ROUTE_LEGS_PER_DAY = 8;

export type DayRouteEnricherContext = {
  routesClient: Pick<GoogleRoutesClient, "computeRoute">;
  maxLegsPerDay?: number;
};

export const enrichDayRoutes = async (
  plan: TripPlanOutput,
  context: DayRouteEnricherContext,
): Promise<TripPlanOutput> => ({
  ...plan,
  days: await Promise.all(
    plan.days.map(async (day) => {
      if (!day.slots?.length) return day;
      return {
        ...day,
        slots: await enrichSlots(day.slots, context),
      };
    }),
  ),
});

const enrichSlots = async (
  slots: ItinerarySlot[],
  context: DayRouteEnricherContext,
): Promise<ItinerarySlot[]> => {
  const maxLegs = context.maxLegsPerDay ?? MAX_ROUTE_LEGS_PER_DAY;
  const nextSlots = [...slots];
  let enrichedLegs = 0;

  for (let index = 1; index < nextSlots.length; index += 1) {
    if (enrichedLegs >= maxLegs) break;

    const from = findPreviousResolvedSlot(nextSlots, index);
    const to = nextSlots[index];
    if (!from?.resolvedPlace || !to?.resolvedPlace) continue;

    nextSlots[index] = {
      ...to,
      routeFromPrevious: await buildRouteLeg(from, to, context.routesClient),
    };
    enrichedLegs += 1;
  }

  return nextSlots;
};

const buildRouteLeg = async (
  from: ItinerarySlot,
  to: ItinerarySlot,
  routesClient: DayRouteEnricherContext["routesClient"],
): Promise<RouteLegSummary> => {
  const results = await Promise.all(
    MODES.map(async (mode) => [
      mode,
      await routesClient.computeRoute({
        origin: from.resolvedPlace!,
        destination: to.resolvedPlace!,
        mode,
      }),
    ] as const),
  );

  return {
    fromSlotId: from.id,
    toSlotId: to.id,
    modes: {
      walking: results.find(([mode]) => mode === "walking")?.[1] ?? fallbackMode("walking"),
      driving: results.find(([mode]) => mode === "driving")?.[1] ?? fallbackMode("driving"),
      transit: results.find(([mode]) => mode === "transit")?.[1] ?? fallbackMode("transit"),
    },
    recommendedMode: "walking",
  };
};

const findPreviousResolvedSlot = (
  slots: ItinerarySlot[],
  beforeIndex: number,
): ItinerarySlot | undefined => {
  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    if (slots[index]?.resolvedPlace) return slots[index];
  }
  return undefined;
};

const fallbackMode = (mode: RouteTravelMode) => ({
  durationMinutes: mode === "walking" ? 15 : mode === "driving" ? 10 : 20,
});
