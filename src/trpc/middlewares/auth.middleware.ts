import { TRPCError } from "@trpc/server";

import { createServiceClient, getUserFromAccessToken } from "@/lib/supabase";
import { parseBearer } from "@/utils/parse-bearer";

import type { middleware } from "../router.js";

export const authMiddleware: Parameters<typeof middleware>[0] = async ({ ctx, next }) => {
  const token = parseBearer(ctx.req.headers.authorization);
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const service = createServiceClient(ctx.env);
  const { user, error } = await getUserFromAccessToken(service, token);
  if (error || !user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      accessToken: token,
      user,
    },
  });
};
