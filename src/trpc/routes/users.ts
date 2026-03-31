import * as userProfileService from "@/services/user-profile.service";
import { patchProfileInputSchema } from "@/shared/validation-schema/user-profile";

import { protectedProcedure, router } from "../router.js";

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return userProfileService.getProfile(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
      ctx.user!.email,
    );
  }),

  updateMe: protectedProcedure.input(patchProfileInputSchema).mutation(async ({ ctx, input }) => {
    return userProfileService.updateProfile(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
      input,
      ctx.user!.email,
    );
  }),
});
