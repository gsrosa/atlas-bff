import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { hasAiProvider } from "@/ai/client";
import { sanitizeUserRequest } from "@/ai/guards/input-sanitizer";
import { assertTripPlanQuality } from "@/ai/guards/quality-assertions";
import {
  ChecklistService,
  EditTripPlanService,
  HotelEnrichService,
  PlanModificationService,
  TripGenerationService,
} from "@/services/ai-services/ai-generate.service";
import { CreditsService } from "@/services/credits.service";
import { TripPlansService } from "@/services/trip-plans.service";
import { editTripPlanInputSchema } from "@/shared/validation-schema/ai-edit";
import { checklistInputSchema, tripPlanInputSchema } from "@/shared/validation-schema/planner-input";
import {
  createTripPlanInputSchema,
  listTripPlansInputSchema,
  patchTripPlanInputSchema,
  tripPlanIdInputSchema,
} from "@/shared/validation-schema/trip-plans";
import {
  creditCostForDays,
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
  modifyCostForDays,
  PLAN_MAX_DAYS,
} from "@/utils/credit";

import { protectedAiProcedure, protectedProcedure, router } from "../router.js";

const requireAiProvider = (env: Parameters<typeof hasAiProvider>[0]) => {
  if (!hasAiProvider(env)) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No AI provider configured" });
  }
};

export const plansRouter = router({
  list: protectedProcedure.input(listTripPlansInputSchema).query(async ({ ctx, input }) => {
    return TripPlansService.listTripPlans(
      ctx.env,
      ctx.accessToken!,
      input.limit,
      input.page,
    );
  }),

  create: protectedProcedure.input(createTripPlanInputSchema).mutation(async ({ ctx, input }) => {
    return TripPlansService.createTripPlan(
      ctx.env,
      ctx.accessToken!,
      ctx.user!.id,
      input,
    );
  }),

  getById: protectedProcedure.input(tripPlanIdInputSchema).query(async ({ ctx, input }) => {
    return TripPlansService.getTripPlanById(ctx.env, ctx.accessToken!, input.id);
  }),

  update: protectedProcedure
    .input(tripPlanIdInputSchema.merge(patchTripPlanInputSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      return TripPlansService.updateTripPlan(ctx.env, ctx.accessToken!, id, patch);
    }),

  delete: protectedProcedure.input(tripPlanIdInputSchema).mutation(async ({ ctx, input }) => {
    await TripPlansService.deleteTripPlan(ctx.env, ctx.accessToken!, input.id);
    return { ok: true as const };
  }),

  generateChecklist: protectedAiProcedure
    .input(checklistInputSchema)
    .mutation(async ({ ctx, input }) => {
      requireAiProvider(ctx.env);
      const { answers, tripDetails } = input;
      const hotelDays = tripDetails?.hotels ? deriveDayCountFromHotels(tripDetails.hotels) : null;
      const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);
      if (effectiveDays !== null && effectiveDays > PLAN_MAX_DAYS) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "TRIP_TOO_LONG" });
      }
      return ChecklistService.generateChecklistFromAnswers(
        ctx.env,
        answers,
        { accessToken: ctx.accessToken, userId: ctx.user?.id },
        tripDetails,
      );
    }),

  generateTrip: protectedAiProcedure
    .input(tripPlanInputSchema)
    .mutation(async ({ ctx, input }) => {
      requireAiProvider(ctx.env);
      const { answers, aiQuestions, aiAnswers, tripDetails } = input;
      const hotelDays = tripDetails?.hotels ? deriveDayCountFromHotels(tripDetails.hotels) : null;
      const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);
      if (effectiveDays !== null && effectiveDays > PLAN_MAX_DAYS) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "TRIP_TOO_LONG" });
      }
      const planCost = creditCostForDays(effectiveDays ?? 7) ?? 5;
      const userId = ctx.user!.id;
      const { balance } = await CreditsService.getBalance(ctx.env, ctx.accessToken!, userId);
      if (balance < planCost) {
        throw new TRPCError({ code: "FORBIDDEN", message: "INSUFFICIENT_CREDITS" });
      }
      const plan = await TripGenerationService.generateTripPlanFromAnswers(
        ctx.env,
        answers,
        aiQuestions,
        aiAnswers,
        { accessToken: ctx.accessToken, userId },
        tripDetails,
      );
      assertTripPlanQuality(plan, { expectedDays: effectiveDays });
      if (plan.days.length > PLAN_MAX_DAYS) {
        plan.days = plan.days.slice(0, PLAN_MAX_DAYS);
      }
      await CreditsService.applyCredit(ctx.env, {
        userId,
        delta: -planCost,
        reason: "plan_generate",
        referenceType: "trip_plan",
      });
      return plan;
    }),

  modifyPlan: protectedAiProcedure
    .input(z.object({ itinerary: z.record(z.unknown()), request: z.string().min(1).max(10_000) }))
    .mutation(async ({ ctx, input }) => {
      requireAiProvider(ctx.env);
      const sanitizedRequest = sanitizeUserRequest(input.request);
      const itineraryDays = Array.isArray(input.itinerary.days)
        ? (input.itinerary.days as unknown[]).length
        : 7;
      const cost = modifyCostForDays(itineraryDays);
      const userId = ctx.user!.id;
      const { balance } = await CreditsService.getBalance(ctx.env, ctx.accessToken!, userId);
      if (balance < cost) {
        throw new TRPCError({ code: "FORBIDDEN", message: "INSUFFICIENT_CREDITS" });
      }
      const result = await PlanModificationService.applyPlanModification(
        ctx.env,
        input.itinerary,
        sanitizedRequest,
      );
      await CreditsService.applyCredit(ctx.env, {
        userId,
        delta: -cost,
        reason: "plan_modify",
        referenceType: "trip_plan",
      });
      return result;
    }),

  editPlan: protectedAiProcedure
    .input(editTripPlanInputSchema)
    .mutation(async ({ ctx, input }) => {
      requireAiProvider(ctx.env);
      const userPrompt = sanitizeUserRequest(input.userPrompt, { maxLength: 100_000 });
      return EditTripPlanService.editTripPlan(ctx.env, {
        userPrompt,
        maxTokens: input.maxOutputTokens,
        temperature: input.temperature,
      });
    }),

  enrichHotel: protectedAiProcedure
    .input(
      z.object({
        name: z.string().min(1).max(500),
        destination: z.string().max(500).default(""),
        checkinDate: z.string().optional(),
        checkoutDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAiProvider(ctx.env);
      return HotelEnrichService.enrichHotelInfo(
        ctx.env,
        input.name,
        input.destination,
        input.checkinDate,
        input.checkoutDate,
      );
    }),
});
