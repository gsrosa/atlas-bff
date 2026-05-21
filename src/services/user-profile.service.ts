import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import type { Env } from "@/env";
import { createServiceClient, createUserScopedClient } from "@/lib/supabase";
import * as creditsService from "@/services/credits.service";
import type { ProfileDTO } from "@/shared/dtos/profile";
import { type patchProfileInputSchema } from "@/shared/validation-schema/user-profile";

type PatchProfileInput = z.infer<typeof patchProfileInputSchema>;

/** Users created before `handle_new_user` or without DB triggers may lack rows; mirror trigger behavior. */
async function ensureProfileAndCreditsRows(
  env: Env,
  userId: string,
  email: string | undefined,
): Promise<void> {
  const svc = createServiceClient(env);
  const displayName = email ? email.split("@")[0] : "User";

  const { error: pErr } = await svc.from("profiles").insert({
    id: userId,
    display_name: displayName,
  });
  if (pErr && pErr.code !== "23505") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: pErr.message,
      cause: pErr,
    });
  }

  const { data: creditRows, error: cErr } = await svc
    .from("user_credits")
    .upsert(
      { user_id: userId, balance: 0 },
      { onConflict: "user_id", ignoreDuplicates: true },
    )
    .select("user_id");
  if (cErr) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: cErr.message,
      cause: cErr,
    });
  }
  // Row was inserted (not a duplicate) — grant signup bonus
  if (creditRows && creditRows.length > 0) {
    await creditsService.addFundsForUser(env, userId, 20, "signup_bonus");
  }
}

export const getProfile = async (
  env: Env,
  accessToken: string,
  userId: string,
  email: string | undefined,
): Promise<{ profile: ProfileDTO | null }> => {
  const client = createUserScopedClient(env, accessToken);
  const result = await client.from("profiles").select("*").maybeSingle();
  const { error: profileError } = result;
  let { data: profile } = result;
  if (profileError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: profileError.message,
      cause: profileError,
    });
  }

  if (!profile) {
    await ensureProfileAndCreditsRows(env, userId, email);
    const retry = await client.from("profiles").select("*").maybeSingle();
    if (retry.error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: retry.error.message,
        cause: retry.error,
      });
    }
    profile = retry.data;
  }
  const { data: credits, error: creditsError } = await client
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();
  if (creditsError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: creditsError.message,
      cause: creditsError,
    });
  }

  if (!profile) {
    return { profile: null };
  }

  const row = profile as Record<string, unknown>;
  const dto: ProfileDTO = {
    id: row.id as string,
    email: email ?? null,
    display_name: (row.display_name as string | null) ?? null,
    first_name: (row.first_name as string | null) ?? null,
    last_name: (row.last_name as string | null) ?? null,
    gender: (row.gender as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    avatar_url: (row.avatar_url as string | null) ?? null,
    preferred_locale: (row.preferred_locale as string | null) ?? null,
    credits_balance: Number(credits?.balance ?? 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  return { profile: dto };
};

export const updateProfile = async (
  env: Env,
  accessToken: string,
  userId: string,
  input: PatchProfileInput,
  email: string | undefined,
): Promise<{ profile: ProfileDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.display_name !== undefined)
    updates.display_name = input.display_name;
  if (input.first_name !== undefined) updates.first_name = input.first_name;
  if (input.last_name !== undefined) updates.last_name = input.last_name;
  if (input.gender !== undefined) updates.gender = input.gender;
  if (input.phone !== undefined)
    updates.phone = input.phone === "" ? null : input.phone;
  if (input.bio !== undefined)
    updates.bio = input.bio === "" ? null : input.bio;
  if (input.country !== undefined) updates.country = input.country;
  if (input.avatar_url !== undefined) {
    updates.avatar_url = input.avatar_url === "" ? null : input.avatar_url;
  }
  if (input.preferred_locale !== undefined)
    updates.preferred_locale = input.preferred_locale ?? null;

  const { error } = await client
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }

  const out = await getProfile(env, accessToken, userId, email);
  if (!out.profile) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
  }
  return { profile: out.profile };
};
