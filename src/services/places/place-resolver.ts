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

export type MealResolverContext = {
  placesClient: Pick<GooglePlacesClient, "searchText">;
  maxMealRequests?: number;
};

export const resolveMealSlots = async (
  plan: TripPlanOutput,
  context: MealResolverContext,
): Promise<TripPlanOutput> => {
  const usedPlaceIds = new Set<string>();
  const usedNames = new Set<string>();
  let requestCount = 0;

  const days = [];
  for (const day of plan.days) {
    if (!day.slots?.length) {
      days.push(day);
      continue;
    }

    const slots: ItinerarySlot[] = [];
    for (const slot of day.slots) {
      if (!shouldResolveMealSlot(slot)) {
        slots.push(slot);
        continue;
      }
      if (requestCount >= (context.maxMealRequests ?? MAX_MEAL_RESOLVE_REQUESTS)) {
        slots.push(slot);
        continue;
      }

      requestCount += 1;
      const anchor = findAnchor(day.slots, slot);
      const candidates = await context.placesClient.searchText(
        buildMealQuery(slot),
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
        slots.push(slot);
        continue;
      }

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
      },
    },
  });
};

const shouldResolveMealSlot = (slot: ItinerarySlot): boolean =>
  slot.kind === "meal" &&
  slot.resolve?.kind === "restaurant" &&
  !slot.resolvedPlace;

const buildMealQuery = (slot: ItinerarySlot): string => {
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
