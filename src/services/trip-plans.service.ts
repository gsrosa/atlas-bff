import { TRPCError } from "@trpc/server";

import { createUserScopedClient } from "@/lib/supabase";
import type { Env } from "@/env/env";
import * as creditsService from "@/services/credits.service";
import type { TripPlanDTO } from "@/shared/dtos/trip-plan";
import {
  createTripPlanInputSchema,
  patchTripPlanInputSchema,
} from "@/shared/validation-schema/trip-plans";
import type { z } from "zod";

type CreateTripPlanInput = z.infer<typeof createTripPlanInputSchema>;
type PatchTripPlanInput = z.infer<typeof patchTripPlanInputSchema>;

const mapInputToRow = (input: CreateTripPlanInput) => ({
  title: input.title ?? null,
  ai_suggested_title: input.aiSuggestedTitle ?? null,
  departure_at: input.departureAt ?? null,
  arrival_at: input.arrivalAt ?? null,
  flight_numbers: input.flightNumbers,
  days_count: input.daysCount ?? null,
  destination: input.destination ?? null,
  destination_country: input.destinationCountry ?? null,
  form_snapshot: input.formSnapshot,
  itinerary: input.itinerary,
});

export const listTripPlans = async (
  env: Env,
  accessToken: string,
  limit: number,
): Promise<{ plans: TripPlanDTO[] }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client
    .from("trip_plans")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { plans: (data ?? []) as TripPlanDTO[] };
};

export const createTripPlan = async (
  env: Env,
  accessToken: string,
  userId: string,
  input: CreateTripPlanInput,
): Promise<{ plan: TripPlanDTO }> => {
  const cost = env.CREDITS_TRIP_PLAN_COST;
  if (cost > 0) {
    const { balance } = await creditsService.getBalance(env, accessToken, userId);
    if (balance < cost) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not enough credits to save this trip plan",
      });
    }
  }

  const client = createUserScopedClient(env, accessToken);
  const row = {
    user_id: userId,
    ...mapInputToRow(input),
  };

  const { data, error } = await client.from("trip_plans").insert(row).select().single();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }

  const plan = data as TripPlanDTO;

  if (cost > 0) {
    try {
      await creditsService.applyCredit(env, {
        userId,
        delta: -cost,
        reason: "trip_plan_create",
        referenceType: "trip_plan",
        referenceId: plan.id,
        metadata: { title: plan.title },
      });
    } catch (e) {
      await client.from("trip_plans").delete().eq("id", plan.id);
      throw e;
    }
  }

  return { plan };
};

export const getTripPlanById = async (
  env: Env,
  accessToken: string,
  id: string,
): Promise<{ plan: TripPlanDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client.from("trip_plans").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  if (!data) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Trip plan not found" });
  }
  return { plan: data as TripPlanDTO };
};

export const updateTripPlan = async (
  env: Env,
  accessToken: string,
  id: string,
  input: PatchTripPlanInput,
): Promise<{ plan: TripPlanDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) updates.title = input.title;
  if (input.aiSuggestedTitle !== undefined) updates.ai_suggested_title = input.aiSuggestedTitle;
  if (input.departureAt !== undefined) updates.departure_at = input.departureAt;
  if (input.arrivalAt !== undefined) updates.arrival_at = input.arrivalAt;
  if (input.flightNumbers !== undefined) updates.flight_numbers = input.flightNumbers;
  if (input.daysCount !== undefined) updates.days_count = input.daysCount;
  if (input.destination !== undefined) updates.destination = input.destination;
  if (input.destinationCountry !== undefined) updates.destination_country = input.destinationCountry;
  if (input.formSnapshot !== undefined) updates.form_snapshot = input.formSnapshot;
  if (input.itinerary !== undefined) updates.itinerary = input.itinerary;

  const { data, error } = await client
    .from("trip_plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  if (!data) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Trip plan not found" });
  }
  return { plan: data as TripPlanDTO };
};

export const deleteTripPlan = async (env: Env, accessToken: string, id: string): Promise<void> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client.from("trip_plans").delete().eq("id", id).select("id");
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  if (!data?.length) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Trip plan not found" });
  }
};
