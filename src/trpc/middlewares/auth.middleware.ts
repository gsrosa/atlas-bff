import { TRPCError } from "@trpc/server";

import { createServiceClient, getUserFromAccessToken } from "@/lib/supabase";
import { resolveSession } from "@/sessions/session";
import { parseSessionIdFromCookie } from "@/sessions/session-cookie";
import { parseBearer } from "@/utils/parse-bearer";

import type { middleware } from "../router.js";

export const authMiddleware: Parameters<typeof middleware>[0] = async ({ ctx, next }) => {
  const sessionId = parseSessionIdFromCookie(ctx.req.headers.cookie, ctx.env);

  if (sessionId) {
    try {
      const resolved = await resolveSession(ctx.env, sessionId);
      if (resolved) {
        return next({
          ctx: {
            ...ctx,
            accessToken: resolved.accessToken,
            user: resolved.user,
            sessionId,
          },
        });
      }
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Session store unavailable",
      });
    }
  }

  const bearer = parseBearer(ctx.req.headers.authorization);
  if (bearer) {
    const service = createServiceClient(ctx.env);
    const { user, error } = await getUserFromAccessToken(service, bearer);
    if (error || !user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        accessToken: bearer,
        user,
      },
    });
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
};
