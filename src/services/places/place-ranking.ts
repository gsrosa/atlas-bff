import type { GooglePlaceCandidate } from "./google-places.client";

export type PlaceRankingContext = {
  usedPlaceIds?: Set<string>;
  usedNames?: Set<string>;
  cuisineHints?: string[];
  budgetHint?: "budget" | "moderate" | "comfort" | "luxury";
  anchor?: {
    lat: number;
    lng: number;
  };
};

const BUDGET_PRICE_LEVEL: Record<
  NonNullable<PlaceRankingContext["budgetHint"]>,
  number
> = {
  budget: 1,
  moderate: 2,
  comfort: 3,
  luxury: 4,
};

export const rankPlaceCandidates = (
  candidates: GooglePlaceCandidate[],
  context: PlaceRankingContext = {},
): GooglePlaceCandidate[] => {
  return candidates
    .filter((candidate) => !isUsed(candidate, context))
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, context),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ candidate }) => candidate);
};

export const selectBestPlaceCandidate = (
  candidates: GooglePlaceCandidate[],
  context: PlaceRankingContext = {},
): GooglePlaceCandidate | null =>
  rankPlaceCandidates(candidates, context)[0] ?? null;

export const markCandidateUsed = (
  candidate: GooglePlaceCandidate,
  context: Required<Pick<PlaceRankingContext, "usedPlaceIds" | "usedNames">>,
): void => {
  context.usedPlaceIds.add(candidate.placeId);
  context.usedNames.add(normalizeName(candidate.name));
};

const scoreCandidate = (
  candidate: GooglePlaceCandidate,
  context: PlaceRankingContext,
): number => {
  const distance = distanceMeters(context.anchor, candidate.location);
  const proximityScore =
    distance === null ? 0 : Math.max(0, 100 - distance / 50);
  const ratingScore = (candidate.rating ?? 0) * 6;
  const reviewScore = Math.min(20, Math.log10((candidate.userRatingsTotal ?? 0) + 1) * 8);
  const cuisineScore = matchesCuisine(candidate, context.cuisineHints) ? 12 : 0;
  const budgetScore = matchesBudget(candidate, context.budgetHint) ? 8 : 0;

  return proximityScore + ratingScore + reviewScore + cuisineScore + budgetScore;
};

const isUsed = (
  candidate: GooglePlaceCandidate,
  context: PlaceRankingContext,
): boolean => {
  if (context.usedPlaceIds?.has(candidate.placeId)) return true;
  return context.usedNames?.has(normalizeName(candidate.name)) ?? false;
};

const matchesCuisine = (
  candidate: GooglePlaceCandidate,
  cuisineHints: string[] | undefined,
): boolean => {
  if (!cuisineHints?.length) return false;
  const name = normalizeName(candidate.name);
  return cuisineHints.some((hint) => name.includes(normalizeName(hint)));
};

const matchesBudget = (
  candidate: GooglePlaceCandidate,
  budgetHint: PlaceRankingContext["budgetHint"],
): boolean => {
  if (!budgetHint || candidate.priceLevel === undefined) return false;
  return candidate.priceLevel <= BUDGET_PRICE_LEVEL[budgetHint];
};

const distanceMeters = (
  a: PlaceRankingContext["anchor"],
  b: GooglePlaceCandidate["location"],
): number | null => {
  if (!a || !b) return null;
  const radius = 6_371_000;
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const normalizeName = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
