import { TRPCError } from "@trpc/server";
import { Router, type Router as ExpressRouter } from "express";

import type { Env } from "@/env/env";
import { requireBearerAuth } from "@/middleware/require-bearer-auth";
import * as userProfileService from "@/services/user-profile.service";

function httpStatusFromTrpc(code: string): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "BAD_REQUEST":
      return 400;
    default:
      return 500;
  }
}

/**
 * `GET /me` — same payload as tRPC `users.me` (profile + credits_balance + email).
 * Auth: httpOnly session cookie or `Authorization: Bearer`.
 */
export const createMeRouter = (env: Env): ExpressRouter => {
  const r = Router();

  r.get("/me", requireBearerAuth(env), async (req, res, next) => {
    try {
      const result = await userProfileService.getProfile(
        env,
        req.atlasAccessToken!,
        req.atlasUser!.id,
        req.atlasUser!.email,
      );
      res.json(result);
    } catch (e) {
      if (e instanceof TRPCError) {
        res.status(httpStatusFromTrpc(e.code)).json({ error: e.message });
        return;
      }
      next(e);
    }
  });

  return r;
};
