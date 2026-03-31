import * as tripPlansService from "@/services/trip-plans.service";
import {
  createTripPlanInputSchema,
  listTripPlansInputSchema,
  patchTripPlanInputSchema,
  tripPlanIdInputSchema,
} from "@/shared/validation-schema/trip-plans";

import { protectedProcedure, router } from "../router.js";

export const plansRouter = router({
  list: protectedProcedure.input(listTripPlansInputSchema).query(async ({ ctx, input }) => {
    return tripPlansService.listTripPlans(ctx.env, ctx.accessToken!, input.limit);
  }),

  create: protectedProcedure.input(createTripPlanInputSchema).mutation(async ({ ctx, input }) => {
    return tripPlansService.createTripPlan(ctx.env, ctx.accessToken!, ctx.user!.id, input);
  }),

  getById: protectedProcedure.input(tripPlanIdInputSchema).query(async ({ ctx, input }) => {
    return tripPlansService.getTripPlanById(ctx.env, ctx.accessToken!, input.id);
  }),

  update: protectedProcedure
    .input(tripPlanIdInputSchema.merge(patchTripPlanInputSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      return tripPlansService.updateTripPlan(ctx.env, ctx.accessToken!, id, patch);
    }),

  delete: protectedProcedure.input(tripPlanIdInputSchema).mutation(async ({ ctx, input }) => {
    await tripPlansService.deleteTripPlan(ctx.env, ctx.accessToken!, input.id);
    return { ok: true as const };
  }),
});
