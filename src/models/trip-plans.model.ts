import type { Env } from "@/env";
import { createUserScopedClient } from "@/lib/supabase";
import type { TripPlanApi } from "@/shared/dtos/trip-plan";
import { InternalServerError, NotFoundError } from "@/shared/errors";

type TripPlanRow = Record<string, unknown>;

export class TripPlansModel {
  static async findAllByUserId(
    env: Env,
    accessToken: string,
    limit: number,
    page: number,
  ): Promise<{ plans: TripPlanApi[]; total: number }> {
    const from = page * limit;
    const to = from + limit - 1;
    const client = createUserScopedClient(env, accessToken);
    const { data, error, count } = await client
      .from("trip_plans")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(from, to);
    if (error) throw new InternalServerError(error.message, error);
    return { plans: (data ?? []) as TripPlanApi[], total: count ?? 0 };
  }

  static async findById(
    env: Env,
    accessToken: string,
    id: string,
  ): Promise<TripPlanApi> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("trip_plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new InternalServerError(error.message, error);
    if (!data) throw new NotFoundError("Trip plan not found");
    return data as TripPlanApi;
  }

  static async create(
    env: Env,
    accessToken: string,
    row: TripPlanRow,
  ): Promise<TripPlanApi> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("trip_plans")
      .insert(row)
      .select()
      .single();
    if (error) throw new InternalServerError(error.message, error);
    return data as TripPlanApi;
  }

  static async update(
    env: Env,
    accessToken: string,
    id: string,
    updates: TripPlanRow,
  ): Promise<TripPlanApi> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("trip_plans")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new InternalServerError(error.message, error);
    if (!data) throw new NotFoundError("Trip plan not found");
    return data as TripPlanApi;
  }

  static async delete(env: Env, accessToken: string, id: string): Promise<void> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("trip_plans")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw new InternalServerError(error.message, error);
    if (!data?.length) throw new NotFoundError("Trip plan not found");
  }
}
