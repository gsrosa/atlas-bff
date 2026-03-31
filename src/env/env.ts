import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  /** Empty string in `.env` is treated as unset (POST /plans/stream will fail until set). */
  GEMINI_API_KEY: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().min(1).optional(),
  ),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  CREDITS_TRIP_PLAN_COST: z.coerce.number().int().min(0).default(0),
  CREDITS_ALLOW_SELF_TOPUP: z.preprocess(
    (val) => val === true || val === "true" || val === "1",
    z.boolean(),
  ).default(false),
  /** Optional: direct Postgres (`postgres` package). Required only if you import `@/db`. */
  DATABASE_URL: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().url().optional(),
  ),
  /** Redis for opaque server-side sessions (httpOnly cookie). Required for cookie-based auth. */
  REDIS_URL: z.string().url(),
  /** Cookie name for the opaque session id (default atlas_session). */
  SESSION_COOKIE_NAME: z.string().min(1).default("atlas_session"),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const hint =
      !process.env.SUPABASE_ANON_KEY?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
        ? "\nSet SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Project Settings → API)."
        : "";
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}${hint}`);
  }
  return parsed.data;
};
