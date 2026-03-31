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
