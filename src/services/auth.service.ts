import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";

import { createServiceClient, createUserScopedClient } from "@/lib/supabase";
import type { Env } from "@/env/env";
import {
  changePasswordInputSchema,
  refreshInputSchema,
  signInInputSchema,
  signUpInputSchema,
} from "@/shared/validation-schema/auth";
import type { z } from "zod";

type SignUpInput = z.infer<typeof signUpInputSchema>;
type SignInInput = z.infer<typeof signInInputSchema>;
type RefreshInput = z.infer<typeof refreshInputSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

/** Supabase Auth uses `fetch`; "fetch failed" usually means the host in SUPABASE_URL is unreachable. */
function isAuthTransportFailure(error: { message: string; cause?: unknown }): boolean {
  if (error.message === "fetch failed") return true;
  const c = error.cause;
  if (c instanceof Error) {
    const code = (c as NodeJS.ErrnoException).code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") return true;
  }
  return false;
}

function describeAuthTransportFailure(error: { message: string; cause?: unknown }): string {
  const parts: string[] = [error.message];
  if (error.cause instanceof Error) {
    parts.push(error.cause.message);
    const code = (error.cause as NodeJS.ErrnoException).code;
    if (code) parts.push(`(${code})`);
  }
  return `${parts.join(" — ")} — Cannot reach Supabase at this URL. Fix SUPABASE_URL, run local Supabase (\`supabase start\`), or check network/VPN/DNS.`;
}

/** Supabase rejects duplicate sign-ups; we treat that as "already created" and complete with sign-in. */
function isDuplicateSignUpError(error: { message?: string; code?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  if (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already")
  ) {
    return true;
  }
  const c = error.code ?? "";
  return c === "user_already_exists" || c === "email_exists";
}

export const signUp = async (env: Env, input: SignUpInput) => {
  const service = createServiceClient(env);
  const displayName = `${input.firstName} ${input.lastName}`.trim();
  const { data, error } = await service.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        gender: input.gender,
        phone: input.phone,
        bio: input.bio,
        country: input.country,
        display_name: displayName,
      },
    },
  });
  if (error) {
    if (isAuthTransportFailure(error)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: describeAuthTransportFailure(error),
        cause: error,
      });
    }
    if (isDuplicateSignUpError(error)) {
      const signedIn = await service.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (signedIn.error) {
        if (isAuthTransportFailure(signedIn.error)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: describeAuthTransportFailure(signedIn.error),
            cause: signedIn.error,
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            signedIn.error.message ||
            "This email is already registered. Use the correct password to sign in, or reset your password.",
          cause: signedIn.error,
        });
      }
      return {
        user: signedIn.data.user,
        session: signedIn.data.session,
        needsEmailConfirmation: false,
        resumedAsSignIn: true as const,
      };
    }
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }
  /** When Supabase has "Confirm email" enabled, `session` is null until the user confirms. */
  const needsEmailConfirmation = Boolean(data.user && !data.session);
  return { user: data.user, session: data.session, needsEmailConfirmation };
};

export const signIn = async (env: Env, input: SignInInput) => {
  const service = createServiceClient(env);
  const { data, error } = await service.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    if (isAuthTransportFailure(error)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: describeAuthTransportFailure(error),
        cause: error,
      });
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      /** Supabase messages include "Email not confirmed", "Invalid login credentials", etc. */
      message: error.message || "Invalid email or password",
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
    if (error && isAuthTransportFailure(error)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: describeAuthTransportFailure(error),
        cause: error,
      });
    }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid refresh token",
      cause: error,
    });
  }
  return { user: data.user, session: data.session };
};

/**
 * Verifies the current password with a stateless client, then updates password on the active session.
 */
export const changePassword = async (
  env: Env,
  accessToken: string,
  email: string,
  input: ChangePasswordInput,
) => {
  const verify = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: verifyErr } = await verify.auth.signInWithPassword({
    email,
    password: input.currentPassword,
  });
  if (verifyErr) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Current password is incorrect",
      cause: verifyErr,
    });
  }

  const userClient = createUserScopedClient(env, accessToken);
  const { error: updErr } = await userClient.auth.updateUser({
    password: input.newPassword,
  });
  if (updErr) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: updErr.message,
      cause: updErr,
    });
  }
  return { ok: true as const };
};
