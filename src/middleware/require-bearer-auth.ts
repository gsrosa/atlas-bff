import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { Env } from "@/env/env";
import { createServiceClient, getUserFromAccessToken } from "@/lib/supabase";
import { resolveSession } from "@/sessions/session";
import { parseSessionIdFromCookie } from "@/sessions/session-cookie";
import { parseBearer } from "@/utils/parse-bearer";

/**
 * Requires a valid Supabase session: **session cookie** (Redis) first, then `Authorization: Bearer`.
 * Refreshes tokens in Redis when the access JWT is invalid.
 */
export const requireBearerAuth =
  (env: Env): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const sid = parseSessionIdFromCookie(req.headers.cookie, env);
    if (sid) {
      try {
        const resolved = await resolveSession(env, sid);
        if (resolved) {
          req.atlasAccessToken = resolved.accessToken;
          req.atlasUser = resolved.user;
          req.atlasSessionId = sid;
          next();
          return;
        }
      } catch {
        res.status(503).json({ error: "Session store unavailable" });
        return;
      }
    }

    const token = parseBearer(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: "Missing session cookie or Authorization header" });
      return;
    }
    const service = createServiceClient(env);
    const { user, error } = await getUserFromAccessToken(service, token);
    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    req.atlasAccessToken = token;
    req.atlasUser = user;
    next();
  };
