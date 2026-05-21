import { type Router as ExpressRouter, Router } from "express";

import type { Env } from "@/env";
import { UserProfileService } from "@/services/user-profile.service";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/shared/errors";
import { requireBearerAuth } from "@/trpc/middlewares/require-bearer-auth.middleware";

function httpStatusFromError(error: unknown): number {
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof BadRequestError) return 400;
  return 500;
}

export const createMeRouter = (env: Env): ExpressRouter => {
  const r = Router();

  r.get("/me", requireBearerAuth(env), async (req, res, next) => {
    try {
      const result = await UserProfileService.getProfile(
        env,
        req.nexploringAccessToken!,
        req.nexploringUser!.id,
        req.nexploringUser!.email,
      );
      res.json(result);
    } catch (e) {
      if (e instanceof Error) {
        res.status(httpStatusFromError(e)).json({ error: e.message });
        return;
      }
      next(e);
    }
  });

  return r;
};
