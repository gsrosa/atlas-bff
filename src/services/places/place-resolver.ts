import { adaptSlotsForCompatibility } from "@/services/itinerary/slot-adapter";
import type {
  ItinerarySlot,
  ResolvedPlace,
  TripPlanOutput,
} from "@/shared/validation-schema/ai-output";

import {
  type GooglePlaceCandidate,
  type GooglePlacesClient,
} from "./google-places.client";
import { markCandidateUsed, selectBestPlaceCandidate } from "./place-ranking";

const MAX_MEAL_RESOLVE_REQUESTS = 30;
const MAX_ATTRACTION_RESOLVE_REQUESTS = 30;

export type PlaceResolverContext = {
  placesClient: Pick<GooglePlacesClient, "searchText">;
  maxMealRequests?: number;
  maxAttractionRequests?: number;
};

export const resolvePlaceSlots = async (
  plan: TripPlanOutput,
  context: PlaceResolverContext,
): Promise<TripPlanOutput> => {
  const usedPlaceIds = new Set<string>();
  const usedNames = new Set<string>();
  let requestCount = 0;
  let resolvedCount = 0;
  let unresolvedCount = 0;

  const days = [];
  for (const day of plan.days) {
    if (!day.slots?.length) {
      days.push(day);
      continue;
    }

    const slots: ItinerarySlot[] = [];
    for (const slot of day.slots) {
      if (!shouldResolveSlot(slot)) {
        slots.push(slot);
        continue;
      }
      if (requestCount >= getRequestCap(slot, context)) {
        slots.push(slot);
        continue;
      }

      requestCount += 1;
      const anchor = findAnchor(day.slots, slot);
      const candidates = await context.placesClient.searchText(
        buildResolveQuery(slot),
        {
          city: slot.resolve?.city ?? slot.city,
          country: slot.resolve?.country ?? slot.country,
          locationBias: anchor
            ? { lat: anchor.lat, lng: anchor.lng, radiusMeters: 1_500 }
            : undefined,
        },
      );
      const selected = selectBestPlaceCandidate(candidates, {
        anchor,
        budgetHint: slot.resolve?.budgetHint,
        cuisineHints: slot.resolve?.cuisineHints,
        usedNames,
        usedPlaceIds,
      });

      if (!selected) {
        unresolvedCount += 1;
        slots.push(slot);
        continue;
      }

      resolvedCount += 1;
      markCandidateUsed(selected, { usedNames, usedPlaceIds });
      slots.push({
        ...slot,
        resolvedPlace: candidateToResolvedPlace(selected),
      });
    }

    days.push({ ...day, slots });
  }

  return adaptSlotsForCompatibility({
    ...plan,
    days,
    meta: {
      ...(plan.meta ?? {}),
      placeResolveStats: {
        ...(plan.meta?.placeResolveStats ?? {}),
        requested: (plan.meta?.placeResolveStats?.requested ?? 0) + requestCount,
        resolved: (plan.meta?.placeResolveStats?.resolved ?? 0) + resolvedCount,
        unresolved:
          (plan.meta?.placeResolveStats?.unresolved ?? 0) + unresolvedCount,
      },
    },
  });
};

export const resolveMealSlots = resolvePlaceSlots;

const shouldResolveSlot = (slot: ItinerarySlot): boolean =>
  !slot.resolvedPlace &&
  Boolean(slot.resolve) &&
  (slot.resolve?.kind === "restaurant" ||
    slot.resolve?.kind === "attraction" ||
    slot.resolve?.kind === "activity_provider" ||
    slot.resolve?.kind === "lodging");

const getRequestCap = (
  slot: ItinerarySlot,
  context: PlaceResolverContext,
): number =>
  slot.resolve?.kind === "restaurant"
    ? (context.maxMealRequests ?? MAX_MEAL_RESOLVE_REQUESTS)
    : (context.maxAttractionRequests ?? MAX_ATTRACTION_RESOLVE_REQUESTS);

const buildResolveQuery = (slot: ItinerarySlot): string => {
  const resolve = slot.resolve;
  const hints = resolve?.cuisineHints?.join(" ") ?? "";
  return [
    resolve?.query ?? slot.title,
    hints,
    slot.area,
    resolve?.nearText,
    resolve?.city ?? slot.city,
  ]
    .filter(Boolean)
    .join(" ");
};

const findAnchor = (
  slots: ItinerarySlot[],
  mealSlot: ItinerarySlot,
): { lat: number; lng: number } | undefined => {
  const index = slots.findIndex((slot) => slot.id === mealSlot.id);
  const before = [...slots.slice(0, Math.max(index, 0))].reverse();
  const after = slots.slice(index + 1);
  return [...before, ...after].find((slot) => slot.resolvedPlace?.location)
    ?.resolvedPlace?.location;
};

const candidateToResolvedPlace = (
  candidate: GooglePlaceCandidate,
): ResolvedPlace => ({
  source: "google_places",
  placeId: candidate.placeId,
  name: candidate.name,
  address: candidate.address,
  rating: candidate.rating,
  userRatingsTotal: candidate.userRatingsTotal,
  priceLevel: candidate.priceLevel,
  location: candidate.location,
  mapsUrl: candidate.mapsUrl,
});
