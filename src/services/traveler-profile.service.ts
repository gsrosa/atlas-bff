import { TRPCError } from "@trpc/server";

import type { Env } from "@/env";
import { createUserScopedClient } from "@/lib/supabase";
import {
  type PatchTravelerProfileInput,
  patchTravelerProfileInputSchema,
  TIER1_TRAVELER_KEYS,
} from "@/shared/validation-schema/traveler-profile";

function isFieldFilled(key: string, value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") {
    if (key === "foodAllergies") return value.trim().length > 0;
    return value.trim().length > 0;
  }
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return !Number.isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function isTier1TravelerProfileComplete(
  data: Record<string, unknown>,
): boolean {
  for (const k of TIER1_TRAVELER_KEYS) {
    if (k === "interests") {
      const arr = data.interests;
      if (!Array.isArray(arr) || arr.length < 1) return false;
      continue;
    }
    if (!isFieldFilled(k, data[k])) return false;
  }
  return true;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

export async function getTravelerPreferences(
  env: Env,
  accessToken: string,
  userId: string,
): Promise<{
  preferences: Record<string, unknown>;
  tier1Complete: boolean;
}> {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("traveler_preferences")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }
  const raw =
    (data?.traveler_preferences as Record<string, unknown> | null) ?? {};
  const preferences =
    raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
  return {
    preferences,
    tier1Complete: isTier1TravelerProfileComplete(preferences),
  };
}

export async function patchTravelerPreferences(
  env: Env,
  accessToken: string,
  userId: string,
  patch: PatchTravelerProfileInput,
): Promise<{
  preferences: Record<string, unknown>;
  tier1Complete: boolean;
}> {
  const parsed = patchTravelerProfileInputSchema.safeParse(patch);
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid traveler profile patch",
      cause: parsed.error,
    });
  }

  const client = createUserScopedClient(env, accessToken);
  const { data: row, error: readErr } = await client
    .from("profiles")
    .select("traveler_preferences")
    .eq("id", userId)
    .maybeSingle();
  if (readErr) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: readErr.message,
      cause: readErr,
    });
  }

  const prev =
    row?.traveler_preferences &&
    typeof row.traveler_preferences === "object" &&
    !Array.isArray(row.traveler_preferences)
      ? { ...(row.traveler_preferences as Record<string, unknown>) }
      : {};

  const delta = stripUndefined(parsed.data as Record<string, unknown>);
  const merged: Record<string, unknown> = { ...prev, ...delta };

  const { error: writeErr } = await client
    .from("profiles")
    .update({
      traveler_preferences: merged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (writeErr) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: writeErr.message,
      cause: writeErr,
    });
  }

  return {
    preferences: merged,
    tier1Complete: isTier1TravelerProfileComplete(merged),
  };
}
