import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "@supabase/supabase-js";

import type { Env } from "@/env/env";

export type Context = {
  env: Env;
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  accessToken?: string;
  user?: User;
  /** Present when auth came from the httpOnly session cookie (used by signOut). */
  sessionId?: string;
};

export const createContextFactory =
  (env: Env) =>
  (opts: CreateExpressContextOptions): Context => ({
    env,
    req: opts.req,
    res: opts.res,
  });
