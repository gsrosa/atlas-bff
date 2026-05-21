import type { Env } from "@/env";
import { createServiceClient, createUserScopedClient } from "@/lib/supabase";
import type { ProfileRow } from "@/shared/dtos/profile";
import { InternalServerError } from "@/shared/errors";

export class UserProfileModel {
  static async findByUserId(
    env: Env,
    accessToken: string,
  ): Promise<ProfileRow | null> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .maybeSingle();
    if (error) throw new InternalServerError(error.message, error);
    return data as ProfileRow | null;
  }

  static async findCreditsBalance(
    env: Env,
    accessToken: string,
    userId: string,
  ): Promise<{ balance: number }> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new InternalServerError(error.message, error);
    return { balance: Number(data?.balance ?? 0) };
  }

  static async insertProfile(
    env: Env,
    userId: string,
    displayName: string,
  ): Promise<void> {
    const client = createServiceClient(env);
    const { error } = await client.from("profiles").insert({
      id: userId,
      display_name: displayName,
    });
    if (error && error.code !== "23505") {
      throw new InternalServerError(error.message, error);
    }
  }

  static async update(
    env: Env,
    accessToken: string,
    userId: string,
    updates: Record<string, unknown>,
  ): Promise<void> {
    const client = createUserScopedClient(env, accessToken);
    const { error } = await client
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    if (error) throw new InternalServerError(error.message, error);
  }
}
