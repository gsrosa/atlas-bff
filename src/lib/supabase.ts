import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Env } from "@/env/env";

/** Validates JWTs and admin auth operations. Never expose this key to clients. */
export const createServiceClient = (env: Env): SupabaseClient => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Supabase client scoped to the caller's JWT so Postgres RLS policies apply.
 * Use this for all user data access (profiles, plans).
 */
export const createUserScopedClient = (env: Env, accessToken: string): SupabaseClient => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const getUserFromAccessToken = async (
  service: SupabaseClient,
  accessToken: string,
): Promise<{ user: User; error: null } | { user: null; error: unknown }> => {
  const { data, error } = await service.auth.getUser(accessToken);
  if (error || !data.user) {
    return { user: null, error };
  }
  return { user: data.user, error: null };
};
