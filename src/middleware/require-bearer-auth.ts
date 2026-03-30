import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { Env } from "@/env/env";
import { createServiceClient, getUserFromAccessToken } from "@/lib/supabase";
import { parseBearer } from "@/utils/parse-bearer";

export const requireBearerAuth =
  (env: Env): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = parseBearer(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
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
