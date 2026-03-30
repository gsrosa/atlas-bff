import * as authService from "@/services/auth.service";
import {
  refreshInputSchema,
  signInInputSchema,
  signUpInputSchema,
} from "@/shared/validation-schema/auth";

import { publicProcedure, router } from "../router.js";

export const authRouter = router({
  signUp: publicProcedure.input(signUpInputSchema).mutation(async ({ ctx, input }) => {
    return authService.signUp(ctx.env, input);
  }),

  signIn: publicProcedure.input(signInInputSchema).mutation(async ({ ctx, input }) => {
    return authService.signIn(ctx.env, input);
  }),

  refresh: publicProcedure.input(refreshInputSchema).mutation(async ({ ctx, input }) => {
    return authService.refreshSession(ctx.env, input);
  }),
});
