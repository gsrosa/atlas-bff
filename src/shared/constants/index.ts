/** Session TTL in seconds — 7 days, refreshed on each request. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Redis key prefix for opaque session IDs. */
export const SESSION_PREFIX = "nexploring:sess:";

/** Redis key prefix for cached AI trip plan JSON. */
export const PLAN_CACHE_PREFIX = "nexploring:plan:";

/** TTL for cached trip plans — 24 hours. */
export const PLAN_CACHE_TTL_SECONDS = 60 * 60 * 24;

/** Global tRPC rate limit — requests per minute per IP. */
export const RATE_LIMIT_TRPC_PER_MIN = 120;

/** AI procedure rate limit — requests per minute per user. */
export const AI_RATE_LIMIT_PER_MIN = 10;

/** Rate limit window in milliseconds (1 minute). */
export const RATE_LIMIT_WINDOW_MS = 60 * 1_000;
