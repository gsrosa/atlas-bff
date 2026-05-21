import { TravelerProfileService } from "@/services/traveler-profile.service";
import { patchTravelerProfileInputSchema } from "@/shared/validation-schema/traveler-profile";

import { protectedProcedure, router } from "../router.js";

export const travelerProfileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return TravelerProfileService.getTravelerPreferences(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
    );
  }),

  patch: protectedProcedure.input(patchTravelerProfileInputSchema).mutation(async ({ ctx, input }) => {
    return TravelerProfileService.patchTravelerPreferences(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
      input,
    );
  }),
});
