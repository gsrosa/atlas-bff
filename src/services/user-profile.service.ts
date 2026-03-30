import { TRPCError } from "@trpc/server";

import { createUserScopedClient } from "@/lib/supabase";
import type { Env } from "@/env/env";
import type { ProfileDTO } from "@/shared/dtos/profile";
import { patchProfileInputSchema } from "@/shared/validation-schema/user-profile";
import type { z } from "zod";

type PatchProfileInput = z.infer<typeof patchProfileInputSchema>;

export const getProfile = async (
  env: Env,
  accessToken: string,
): Promise<{ profile: ProfileDTO | null }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client.from("profiles").select("*").maybeSingle();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { profile: (data as ProfileDTO | null) ?? null };
};

export const updateProfile = async (
  env: Env,
  accessToken: string,
  userId: string,
  input: PatchProfileInput,
): Promise<{ profile: ProfileDTO }> => {
  const client = createUserScopedClient(env, accessToken);
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.display_name !== undefined) updates.display_name = input.display_name;
  if (input.avatar_url !== undefined) {
    updates.avatar_url = input.avatar_url === "" ? null : input.avatar_url;
  }
  const { data, error } = await client
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { profile: data as ProfileDTO };
};
