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
  /** Google AI Studio / Gemini API key — server only; never expose to browsers. */
  GEMINI_API_KEY: z.string().min(1).optional(),
  /** Default model when the client omits `model` (e.g. gemini-2.0-flash). */
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
};
