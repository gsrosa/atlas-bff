import { UserProfileService } from "@/services/user-profile.service";
import { patchProfileInputSchema } from "@/shared/validation-schema/user-profile";

import { protectedProcedure, router } from "../router.js";

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return UserProfileService.getProfile(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
      ctx.user!.email,
    );
  }),

  updateMe: protectedProcedure.input(patchProfileInputSchema).mutation(async ({ ctx, input }) => {
    return UserProfileService.updateProfile(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
      input,
      ctx.user!.email,
    );
  }),
});
