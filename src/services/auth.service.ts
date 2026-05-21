import type { z } from "zod";

import type { Env } from "@/env";
import { AuthModel } from "@/models/auth.model";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "@/shared/errors";
import {
  type changePasswordInputSchema,
  type refreshInputSchema,
  type signInInputSchema,
  type signUpInputSchema,
} from "@/shared/validation-schema/auth";

type SignUpInput = z.infer<typeof signUpInputSchema>;
type SignInInput = z.infer<typeof signInInputSchema>;
type RefreshInput = z.infer<typeof refreshInputSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

/** Supabase Auth uses `fetch`; "fetch failed" usually means the host in SUPABASE_URL is unreachable. */
function isAuthTransportFailure(error: {
  message: string;
  cause?: unknown;
}): boolean {
  if (error.message === "fetch failed") return true;
  const c = error.cause;
  if (c instanceof Error) {
    const code = (c as NodeJS.ErrnoException).code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT")
      return true;
  }
  return false;
}

function describeAuthTransportFailure(error: {
  message: string;
  cause?: unknown;
}): string {
  const parts: string[] = [error.message];
  if (error.cause instanceof Error) {
    parts.push(error.cause.message);
    const code = (error.cause as NodeJS.ErrnoException).code;
    if (code) parts.push(`(${code})`);
  }
  return `${parts.join(" — ")} — Cannot reach Supabase at this URL. Fix SUPABASE_URL, run local Supabase (\`supabase start\`), or check network/VPN/DNS.`;
}

/** Supabase rejects duplicate sign-ups; we treat that as "already created" and complete with sign-in. */
function isDuplicateSignUpError(error: {
  message?: string;
  code?: string;
}): boolean {
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

export class AuthService {
  static async signUp(env: Env, input: SignUpInput) {
    const displayName = `${input.firstName} ${input.lastName}`.trim();

    const { data, error } = await AuthModel.signUp(env, {
      email: input.email,
      password: input.password,
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        gender: input.gender,
        phone: input.phone,
        bio: input.bio,
        country: input.country,
        display_name: displayName,
      },
    });

    if (error) {
      if (isAuthTransportFailure(error)) {
        throw new InternalServerError(
          describeAuthTransportFailure(error),
          error,
        );
      }
      if (isDuplicateSignUpError(error)) {
        const { data: signedIn, error: signInErr } =
          await AuthModel.signInWithPassword(env, {
            email: input.email,
            password: input.password,
          });
        if (signInErr) {
          if (isAuthTransportFailure(signInErr)) {
            throw new InternalServerError(
              describeAuthTransportFailure(signInErr),
              signInErr,
            );
          }
          throw new BadRequestError(
            signInErr.message ||
              "This email is already registered. Use the correct password to sign in, or reset your password.",
            signInErr,
          );
        }
        return {
          user: signedIn.user,
          session: signedIn.session,
          needsEmailConfirmation: false,
          resumedAsSignIn: true as const,
        };
      }
      throw new BadRequestError(error.message, error);
    }

    const needsEmailConfirmation = Boolean(data.user && !data.session);
    return { user: data.user, session: data.session, needsEmailConfirmation };
  }

  static async signIn(env: Env, input: SignInInput) {
    const { data, error } = await AuthModel.signInWithPassword(env, {
      email: input.email,
      password: input.password,
    });
    if (error) {
      if (isAuthTransportFailure(error)) {
        throw new InternalServerError(
          describeAuthTransportFailure(error),
          error,
        );
      }
      throw new UnauthorizedError(
        error.message || "Invalid email or password",
        error,
      );
    }
    return { user: data.user, session: data.session };
  }

  static async refreshSession(env: Env, input: RefreshInput) {
    const { data, error } = await AuthModel.refreshSession(
      env,
      input.refresh_token,
    );
    if (error || !data.session) {
      if (error && isAuthTransportFailure(error)) {
        throw new InternalServerError(
          describeAuthTransportFailure(error),
          error,
        );
      }
      throw new UnauthorizedError("Invalid refresh token", error ?? undefined);
    }
    return { user: data.user, session: data.session };
  }

  static async changePassword(
    env: Env,
    accessToken: string,
    email: string,
    input: ChangePasswordInput,
  ) {
    const { error: verifyErr } = await AuthModel.verifyPassword(env, {
      email,
      password: input.currentPassword,
    });
    if (verifyErr) {
      throw new BadRequestError("Current password is incorrect", verifyErr);
    }

    await AuthModel.updatePassword(env, accessToken, input.newPassword);
    return { ok: true as const };
  }
}
