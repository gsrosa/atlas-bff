import * as plansService from "@/services/plans.service";
import {
  createPlanInputSchema,
  listPlansInputSchema,
  patchPlanInputSchema,
  planIdInputSchema,
} from "@/shared/validation-schema/plans";

import { protectedProcedure, router } from "../router.js";

export const plansRouter = router({
  list: protectedProcedure.input(listPlansInputSchema).query(async ({ ctx, input }) => {
    return plansService.listPlans(ctx.env, ctx.accessToken!, input.status);
  }),

  create: protectedProcedure.input(createPlanInputSchema).mutation(async ({ ctx, input }) => {
    return plansService.createPlan(ctx.env, ctx.accessToken!, ctx.user!.id, input);
  }),

  getById: protectedProcedure.input(planIdInputSchema).query(async ({ ctx, input }) => {
    return plansService.getPlanById(ctx.env, ctx.accessToken!, input.id);
  }),

  update: protectedProcedure
    .input(planIdInputSchema.merge(patchPlanInputSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      return plansService.updatePlan(ctx.env, ctx.accessToken!, id, patch);
    }),

  delete: protectedProcedure.input(planIdInputSchema).mutation(async ({ ctx, input }) => {
    await plansService.deletePlan(ctx.env, ctx.accessToken!, input.id);
    return { ok: true as const };
  }),
});
