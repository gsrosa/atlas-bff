import type { Env } from "@/env";
import { createUserScopedClient } from "@/lib/supabase";
import { InternalServerError } from "@/shared/errors";

export class TravelerProfileModel {
  static async findPreferences(
    env: Env,
    accessToken: string,
    userId: string,
  ): Promise<Record<string, unknown>> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("profiles")
      .select("traveler_preferences")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new InternalServerError(error.message, error);
    const raw = (data?.traveler_preferences as Record<string, unknown> | null) ?? {};
    return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
  }

  static async updatePreferences(
    env: Env,
    accessToken: string,
    userId: string,
    merged: Record<string, unknown>,
  ): Promise<void> {
    const client = createUserScopedClient(env, accessToken);
    const { error } = await client
      .from("profiles")
      .update({
        traveler_preferences: merged,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new InternalServerError(error.message, error);
  }
}
