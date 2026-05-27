import { afterEach, describe, expect, it, vi } from "vitest";

import { GoogleRoutesClient } from "@/services/routes/google-routes.client";

import { buildTestEnv } from "./helpers/test-env";

describe("GoogleRoutesClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no route key is configured", async () => {
    const client = new GoogleRoutesClient(buildTestEnv());

    await expect(
      client.computeRoute({
        origin: place("a"),
        destination: place("b"),
        mode: "walking",
      }),
    ).resolves.toBeNull();
  });

  it("maps Google Routes duration and distance", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          routes: [{ duration: "720s", distanceMeters: 1200 }],
        }),
        { status: 200 },
      ),
    );
    const client = new GoogleRoutesClient(
      buildTestEnv({ GOOGLE_DIRECTIONS_API_KEY: "routes-key" }),
    );

    await expect(
      client.computeRoute({
        origin: place("a"),
        destination: place("b"),
        mode: "walking",
      }),
    ).resolves.toEqual({ durationMinutes: 12, distanceMeters: 1200 });
  });

  it("caches repeated route requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ routes: [{ duration: "60s" }] }), {
        status: 200,
      }),
    );
    const client = new GoogleRoutesClient(
      buildTestEnv({ GOOGLE_DIRECTIONS_API_KEY: "routes-key" }),
    );
    const request = {
      origin: place("a"),
      destination: place("b"),
      mode: "driving" as const,
    };

    await client.computeRoute(request);
    await client.computeRoute(request);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

const place = (id: string) => ({
  source: "google_places" as const,
  placeId: id,
  name: id,
});
