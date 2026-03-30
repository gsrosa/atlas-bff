import { TRPCError } from "@trpc/server";

import { createServiceClient } from "@/lib/supabase";
import type { Env } from "@/env/env";
import {
  refreshInputSchema,
  signInInputSchema,
  signUpInputSchema,
} from "@/shared/validation-schema/auth";
import type { z } from "zod";

type SignUpInput = z.infer<typeof signUpInputSchema>;
type SignInInput = z.infer<typeof signInInputSchema>;
type RefreshInput = z.infer<typeof refreshInputSchema>;

export const signUp = async (env: Env, input: SignUpInput) => {
  const service = createServiceClient(env);
  const { data, error } = await service.auth.signUp({
    email: input.email,
    password: input.password,
    options: input.displayName
      ? { data: { display_name: input.displayName } }
      : undefined,
  });
  if (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }
  return { user: data.user, session: data.session };
};

export const signIn = async (env: Env, input: SignInInput) => {
  const service = createServiceClient(env);
  const { data, error } = await service.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
      cause: error,
    });
  }
  return { user: data.user, session: data.session };
};

export const refreshSession = async (env: Env, input: RefreshInput) => {
  const service = createServiceClient(env);
  const { data, error } = await service.auth.refreshSession({
    refresh_token: input.refresh_token,
  });
  if (error || !data.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid refresh token",
      cause: error,
    });
  }
  return { user: data.user, session: data.session };
};
