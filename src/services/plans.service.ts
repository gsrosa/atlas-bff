import { TRPCError } from "@trpc/server";

import { createUserScopedClient } from "@/lib/supabase";
import type { Env } from "@/env/env";
import type { PlanDTO } from "@/shared/dtos/plan";
import { createPlanInputSchema, patchPlanInputSchema } from "@/shared/validation-schema/plans";
import type { z } from "zod";

type CreatePlanInput = z.infer<typeof createPlanInputSchema>;
type PatchPlanInput = z.infer<typeof patchPlanInputSchema>;

export const listPlans = async (
  env: Env,
  accessToken: string,
  status?: string,
): Promise<{ plans: PlanDTO[] }> => {
  const client = createUserScopedClient(env, accessToken);
  let q = client.from("plans").select("*").order("updated_at", { ascending: false });
  if (status) {
    q = q.eq("status", status);
  }
  const { data, error } = await q;
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { plans: (data ?? []) as PlanDTO[] };
};

export const createPlan = async (
  env: Env,
  accessToken: string,
  userId: string,
  input: CreatePlanInput,
): Promise<{ plan: PlanDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client
    .from("plans")
    .insert({
      user_id: userId,
      title: input.title ?? null,
      status: input.status,
      payload: input.payload,
    })
    .select()
    .single();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { plan: data as PlanDTO };
};

export const getPlanById = async (
  env: Env,
  accessToken: string,
  id: string,
): Promise<{ plan: PlanDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client.from("plans").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  if (!data) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
  }
  return { plan: data as PlanDTO };
};

export const updatePlan = async (
  env: Env,
  accessToken: string,
  id: string,
  input: PatchPlanInput,
): Promise<{ plan: PlanDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) updates.title = input.title;
  if (input.status !== undefined) updates.status = input.status;
  if (input.payload !== undefined) updates.payload = input.payload;
  const { data, error } = await client
    .from("plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  if (!data) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
  }
  return { plan: data as PlanDTO };
};

export const deletePlan = async (env: Env, accessToken: string, id: string): Promise<void> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client.from("plans").delete().eq("id", id).select("id");
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  if (!data?.length) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Plan not found" });
  }
};
