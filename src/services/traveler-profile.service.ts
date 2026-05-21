import type { Env } from "@/env";
import { TravelerProfileModel } from "@/models/traveler-profile.model";
import { BadRequestError } from "@/shared/errors";
import {
  type PatchTravelerProfileInput,
  patchTravelerProfileInputSchema,
  TIER1_TRAVELER_KEYS,
} from "@/shared/validation-schema/traveler-profile";

function isFieldFilled(key: string, value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
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

export class TravelerProfileService {
  static async getTravelerPreferences(
    env: Env,
    accessToken: string,
    userId: string,
  ): Promise<{ preferences: Record<string, unknown>; tier1Complete: boolean }> {
    const preferences = await TravelerProfileModel.findPreferences(
      env,
      accessToken,
      userId,
    );
    return {
      preferences,
      tier1Complete: isTier1TravelerProfileComplete(preferences),
    };
  }

  static async patchTravelerPreferences(
    env: Env,
    accessToken: string,
    userId: string,
    patch: PatchTravelerProfileInput,
  ): Promise<{ preferences: Record<string, unknown>; tier1Complete: boolean }> {
    const parsed = patchTravelerProfileInputSchema.safeParse(patch);
    if (!parsed.success) {
      throw new BadRequestError("Invalid traveler profile patch", parsed.error);
    }

    const prev = await TravelerProfileModel.findPreferences(env, accessToken, userId);
    const delta = stripUndefined(parsed.data as Record<string, unknown>);
    const merged: Record<string, unknown> = { ...prev, ...delta };

    await TravelerProfileModel.updatePreferences(env, accessToken, userId, merged);

    return {
      preferences: merged,
      tier1Complete: isTier1TravelerProfileComplete(merged),
    };
  }
}
