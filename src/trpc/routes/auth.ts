import { TRPCError } from "@trpc/server";

import * as authService from "@/services/auth.service";
import {
  changePasswordInputSchema,
  refreshInputSchema,
  signInInputSchema,
  signUpInputSchema,
} from "@/shared/validation-schema/auth";
import { createSessionFromSupabase, deleteSession } from "@/sessions/session";
import { clearSessionCookie, parseSessionIdFromCookie, setSessionCookie } from "@/sessions/session-cookie";

import { protectedProcedure, publicProcedure, router } from "../router.js";

export const authRouter = router({
  signUp: publicProcedure.input(signUpInputSchema).mutation(async ({ ctx, input }) => {
    const result = await authService.signUp(ctx.env, input);
    if (result.session) {
      const id = await createSessionFromSupabase(ctx.env, result.session);
      setSessionCookie(ctx.res, ctx.env, id);
    }
    const { session: _s, ...rest } = result;
    return rest;
  }),

  signIn: publicProcedure.input(signInInputSchema).mutation(async ({ ctx, input }) => {
    const result = await authService.signIn(ctx.env, input);
    if (result.session) {
      const id = await createSessionFromSupabase(ctx.env, result.session);
      setSessionCookie(ctx.res, ctx.env, id);
    }
    const { session: _s, ...rest } = result;
    return rest;
  }),

  /** Clears httpOnly session cookie and Redis entry. Does not require auth. */
  signOut: publicProcedure.mutation(async ({ ctx }) => {
    const sid = parseSessionIdFromCookie(ctx.req.headers.cookie, ctx.env);
    if (sid) {
      await deleteSession(ctx.env, sid);
    }
    clearSessionCookie(ctx.res, ctx.env);
    return { ok: true as const };
  }),

  refresh: publicProcedure.input(refreshInputSchema).mutation(async ({ ctx, input }) => {
    return authService.refreshSession(ctx.env, input);
  }),

  changePassword: protectedProcedure
    .input(changePasswordInputSchema)
    .mutation(async ({ ctx, input }) => {
      const email = ctx.user!.email;
      if (!email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User email missing; cannot verify password" });
      }
      return authService.changePassword(ctx.env, ctx.accessToken!, email, input);
    }),
});
