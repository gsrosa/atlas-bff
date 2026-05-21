import type { z } from "zod";

import type { Env } from "@/env";
import { CreditsModel } from "@/models/credits.model";
import { TripPlansModel } from "@/models/trip-plans.model";
import { CreditsService } from "@/services/credits.service";
import {
  TripPlanDTOMapper,
  type TripPlanResponseDTO,
  type TripPlansResponseDTO,
} from "@/shared/dtos/trip-plan";
import { ForbiddenError } from "@/shared/errors";
import {
  type createTripPlanInputSchema,
  type patchTripPlanInputSchema,
} from "@/shared/validation-schema/trip-plans";

type CreateTripPlanInput = z.infer<typeof createTripPlanInputSchema>;
type PatchTripPlanInput = z.infer<typeof patchTripPlanInputSchema>;

export class TripPlansService {
  static async listTripPlans(
    env: Env,
    accessToken: string,
    limit: number,
    page: number,
  ): Promise<TripPlansResponseDTO> {
    const { plans, total } = await TripPlansModel.findAllByUserId(
      env,
      accessToken,
      limit,
      page,
    );
    return TripPlanDTOMapper.toListResponse({ plans, total, page, limit });
  }

  static async createTripPlan(
    env: Env,
    accessToken: string,
    userId: string,
    input: CreateTripPlanInput,
  ): Promise<TripPlanResponseDTO> {
    const cost = env.CREDITS_TRIP_PLAN_COST;
    if (cost > 0) {
      const { balance } = await CreditsModel.getBalance(env, accessToken, userId);
      if (balance < cost) {
        throw new ForbiddenError("Not enough credits to save this trip plan");
      }
    }

    const row = TripPlanDTOMapper.createInputToAPI(userId, input);
    const plan = await TripPlansModel.create(env, accessToken, row);

    if (cost > 0) {
      try {
        await CreditsService.applyCredit(env, {
          userId,
          delta: -cost,
          reason: "trip_plan_create",
          referenceType: "trip_plan",
          referenceId: plan.id,
          metadata: { title: plan.title },
        });
      } catch (e) {
        await TripPlansModel.delete(env, accessToken, plan.id);
        throw e;
      }
    }

    return TripPlanDTOMapper.toResponse(plan);
  }

  static async getTripPlanById(
    env: Env,
    accessToken: string,
    id: string,
  ): Promise<TripPlanResponseDTO> {
    const plan = await TripPlansModel.findById(env, accessToken, id);
    return TripPlanDTOMapper.toResponse(plan);
  }

  static async updateTripPlan(
    env: Env,
    accessToken: string,
    id: string,
    input: PatchTripPlanInput,
  ): Promise<TripPlanResponseDTO> {
    const updates = TripPlanDTOMapper.patchInputToAPI(input);
    const plan = await TripPlansModel.update(env, accessToken, id, updates);
    return TripPlanDTOMapper.toResponse(plan);
  }

  static async deleteTripPlan(
    env: Env,
    accessToken: string,
    id: string,
  ): Promise<void> {
    await TripPlansModel.delete(env, accessToken, id);
  }
}
