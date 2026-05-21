import type { NextFunction, Request, RequestHandler, Response } from "express";

import { resolveSession } from "@/config/session/session";
import { parseSessionIdFromCookie } from "@/config/session/session-cookie";
import type { Env } from "@/env";
import { createServiceClient, getUserFromAccessToken } from "@/lib/supabase";
import { parseBearer } from "@/utils/parse-bearer";

export const requireBearerAuth =
  (env: Env): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const sid = parseSessionIdFromCookie(req.headers.cookie, env);
    if (sid) {
      try {
        const resolved = await resolveSession(env, sid);
        if (resolved) {
          req.nexploringAccessToken = resolved.accessToken;
          req.nexploringUser = resolved.user;
          req.nexploringSessionId = sid;
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
      res
        .status(401)
        .json({ error: "Missing session cookie or Authorization header" });
      return;
    }
    const service = createServiceClient(env);
    const { user, error } = await getUserFromAccessToken(service, token);
    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    req.nexploringAccessToken = token;
    req.nexploringUser = user;
    next();
  };
