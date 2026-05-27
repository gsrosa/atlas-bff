import { describe, expect, it } from "vitest";

import { buildDayMapRoute } from "@/services/maps/day-map-builder";
import type { ItinerarySlot } from "@/shared/validation-schema/ai-output";

describe("buildDayMapRoute", () => {
  it("builds an ordered route from resolved place IDs", () => {
    const route = buildDayMapRoute(1, [
      resolvedSlot("a", "Museum", "museum-place"),
      unresolvedSlot("walk", "Waterfront walk"),
      resolvedSlot("b", "Dinner", "dinner-place"),
    ]);

    expect(route?.placeIds).toEqual(["museum-place", "dinner-place"]);
    expect(route?.unresolvedStopTitles).toEqual(["Waterfront walk"]);
    expect(route?.mapsUrl).toContain("origin=place_id%3Amuseum-place");
    expect(route?.mapsUrl).toContain("destination=place_id%3Adinner-place");
  });

  it("returns undefined when no stops are resolved", () => {
    expect(buildDayMapRoute(1, [unresolvedSlot("a", "Walk")])).toBeUndefined();
  });
});

const resolvedSlot = (
  id: string,
  title: string,
  placeId: string,
): ItinerarySlot => ({
  id,
  dayNumber: 1,
  startTime: "09:00",
  kind: "attraction",
  title,
  city: "Lisbon",
  resolvedPlace: {
    source: "google_places",
    placeId,
    name: title,
  },
});

const unresolvedSlot = (id: string, title: string): ItinerarySlot => ({
  id,
  dayNumber: 1,
  startTime: "10:00",
  kind: "activity",
  title,
  city: "Lisbon",
});
