import { createClient } from "@supabase/supabase-js";

import type { Env } from "@/env";
import { createServiceClient, createUserScopedClient } from "@/lib/supabase";
import { InternalServerError } from "@/shared/errors";

type SignUpOptions = {
  email: string;
  password: string;
  data: Record<string, unknown>;
};

type SignInOptions = {
  email: string;
  password: string;
};

export class AuthModel {
  static async signUp(env: Env, opts: SignUpOptions) {
    const client = createServiceClient(env);
    const { data, error } = await client.auth.signUp({
      email: opts.email,
      password: opts.password,
      options: { data: opts.data },
    });
    return { data, error };
  }

  static async signInWithPassword(env: Env, opts: SignInOptions) {
    const client = createServiceClient(env);
    const { data, error } = await client.auth.signInWithPassword({
      email: opts.email,
      password: opts.password,
    });
    return { data, error };
  }

  static async verifyPassword(env: Env, opts: SignInOptions) {
    const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.signInWithPassword({
      email: opts.email,
      password: opts.password,
    });
    return { data, error };
  }

  static async refreshSession(env: Env, refreshToken: string) {
    const client = createServiceClient(env);
    const { data, error } = await client.auth.refreshSession({
      refresh_token: refreshToken,
    });
    return { data, error };
  }

  static async updatePassword(
    env: Env,
    accessToken: string,
    password: string,
  ): Promise<void> {
    const client = createUserScopedClient(env, accessToken);
    const { error } = await client.auth.updateUser({ password });
    if (error) throw new InternalServerError(error.message, error);
  }
}
