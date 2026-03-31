import type { Env } from "@/env/env";

/** Deterministic env for unit / HTTP tests (no real Supabase or Redis required for unauthenticated routes). */
export function buildTestEnv(overrides: Partial<Env> = {}): Env {
  return {
    NODE_ENV: "test",
    PORT: 4000,
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "test-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    CORS_ORIGINS: ["http://localhost:5173"],
    GEMINI_MODEL: "gemini-2.0-flash",
    CREDITS_TRIP_PLAN_COST: 0,
    CREDITS_ALLOW_SELF_TOPUP: false,
    REDIS_URL: "redis://127.0.0.1:6379",
    SESSION_COOKIE_NAME: "atlas_session",
    ...overrides,
  };
}
