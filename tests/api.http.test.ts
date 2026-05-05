import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@/app";

import { buildTestEnv } from "./helpers/test-env";
import { plansListInputEncoded, voidInputEncoded } from "./helpers/trpc-inputs";

describe("HTTP API (unauthenticated)", () => {
  const app = createApp(buildTestEnv());

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /me without auth returns 401", async () => {
    const res = await request(app).get("/me").expect(401);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });

  it("POST /plans/stream without auth returns 401", async () => {
    await request(app).post("/plans/stream").send({}).expect(401);
  });

  it("GET /trpc/users.me without auth returns 401", async () => {
    await request(app).get(`/trpc/users.me?input=${voidInputEncoded}`).expect(401);
  });

  it("GET /trpc/credits.balance without auth returns 401", async () => {
    await request(app).get(`/trpc/credits.balance?input=${voidInputEncoded}`).expect(401);
  });

  it("GET /trpc/plans.list without auth returns 401", async () => {
    await request(app).get(`/trpc/plans.list?input=${plansListInputEncoded}`).expect(401);
  });
});

describe("HTTP API CORS", () => {
  it("reflects an exact allowed origin", async () => {
    const app = createApp(
      buildTestEnv({ CORS_ORIGINS: ["https://nexploring.vercel.app"] }),
    );

    const res = await request(app)
      .options("/trpc/users.me")
      .set("Origin", "https://nexploring.vercel.app")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://nexploring.vercel.app",
    );
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("normalizes configured origins copied with a trailing slash", async () => {
    const app = createApp(
      buildTestEnv({ CORS_ORIGINS: ["https://nexploring-payment.vercel.app/"] }),
    );

    const res = await request(app)
      .options("/trpc/users.me")
      .set("Origin", "https://nexploring-payment.vercel.app")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://nexploring-payment.vercel.app",
    );
  });

  it("supports explicit wildcard origins for Vercel preview deployments", async () => {
    const app = createApp(
      buildTestEnv({ CORS_ORIGINS: ["https://*.vercel.app"] }),
    );

    const res = await request(app)
      .options("/trpc/users.me")
      .set("Origin", "https://nexploring-payment-git-main-team.vercel.app")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://nexploring-payment-git-main-team.vercel.app",
    );
  });

  it("does not emit CORS headers for a rejected origin", async () => {
    const app = createApp(
      buildTestEnv({ CORS_ORIGINS: ["https://nexploring.vercel.app"] }),
    );

    const res = await request(app)
      .options("/trpc/users.me")
      .set("Origin", "https://example.com")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
