import { createSessionFromSupabase, deleteSession } from "@/config/session/session";
import { clearSessionCookie, parseSessionIdFromCookie, setSessionCookie } from "@/config/session/session-cookie";
import { AuthService } from "@/services/auth.service";
import { BadRequestError } from "@/shared/errors";
import {
  changePasswordInputSchema,
  refreshInputSchema,
  signInInputSchema,
  signUpInputSchema,
} from "@/shared/validation-schema/auth";

import { protectedProcedure, publicProcedure, router } from "../router.js";

export const authRouter = router({
  signUp: publicProcedure.input(signUpInputSchema).mutation(async ({ ctx, input }) => {
    const result = await AuthService.signUp(ctx.env, input);
    if (result.session) {
      const id = await createSessionFromSupabase(ctx.env, result.session);
      setSessionCookie(ctx.res, ctx.env, id);
    }
    const { ...rest } = result;
    return rest;
  }),

  signIn: publicProcedure.input(signInInputSchema).mutation(async ({ ctx, input }) => {
    const result = await AuthService.signIn(ctx.env, input);
    if (result.session) {
      const id = await createSessionFromSupabase(ctx.env, result.session);
      setSessionCookie(ctx.res, ctx.env, id);
    }
    const { ...rest } = result;
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
    return AuthService.refreshSession(ctx.env, input);
  }),

  changePassword: protectedProcedure
    .input(changePasswordInputSchema)
    .mutation(async ({ ctx, input }) => {
      const email = ctx.user!.email;
      if (!email) {
        throw new BadRequestError("User email missing; cannot verify password");
      }
      return AuthService.changePassword(ctx.env, ctx.accessToken!, email, input);
    }),
});
