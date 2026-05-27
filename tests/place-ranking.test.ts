import { describe, expect, it } from "vitest";

import type { GooglePlaceCandidate } from "@/services/places/google-places.client";
import {
  markCandidateUsed,
  rankPlaceCandidates,
  selectBestPlaceCandidate,
} from "@/services/places/place-ranking";

const candidate = (
  patch: Partial<GooglePlaceCandidate>,
): GooglePlaceCandidate => ({
  placeId: patch.placeId ?? "place",
  name: patch.name ?? "Place",
  rating: patch.rating,
  userRatingsTotal: patch.userRatingsTotal,
  priceLevel: patch.priceLevel,
  location: patch.location,
});

describe("place ranking", () => {
  it("prioritizes proximity over rating when distance differs meaningfully", () => {
    const ranked = rankPlaceCandidates(
      [
        candidate({
          placeId: "far",
          name: "Far Famous",
          rating: 4.9,
          userRatingsTotal: 9000,
          location: { lat: 35.8, lng: 139.8 },
        }),
        candidate({
          placeId: "near",
          name: "Near Good",
          rating: 4.2,
          userRatingsTotal: 300,
          location: { lat: 35.7005, lng: 139.7005 },
        }),
      ],
      { anchor: { lat: 35.7, lng: 139.7 } },
    );

    expect(ranked[0]?.placeId).toBe("near");
  });

  it("dedupes by place id and normalized name", () => {
    const ranked = rankPlaceCandidates(
      [
        candidate({ placeId: "used-id", name: "New Name" }),
        candidate({ placeId: "other-id", name: "Cafe São Bento" }),
        candidate({ placeId: "fresh", name: "Fresh Cafe" }),
      ],
      {
        usedPlaceIds: new Set(["used-id"]),
        usedNames: new Set(["cafe sao bento"]),
      },
    );

    expect(ranked.map((item) => item.placeId)).toEqual(["fresh"]);
  });

  it("marks selected candidates as used", () => {
    const selected = selectBestPlaceCandidate([
      candidate({ placeId: "ramen", name: "Ramen House" }),
    ]);
    const usedPlaceIds = new Set<string>();
    const usedNames = new Set<string>();

    if (selected) markCandidateUsed(selected, { usedPlaceIds, usedNames });

    expect(usedPlaceIds.has("ramen")).toBe(true);
    expect(usedNames.has("ramen house")).toBe(true);
  });
});
