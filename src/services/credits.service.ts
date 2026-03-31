import { TRPCError } from "@trpc/server";

import { createServiceClient, createUserScopedClient } from "@/lib/supabase";
import type { Env } from "@/env/env";
import type { CreditTransactionDTO } from "@/shared/dtos/credit";

export const getBalance = async (
  env: Env,
  accessToken: string,
  userId: string,
): Promise<{ balance: number }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { balance: data?.balance ?? 0 };
};

export const listTransactions = async (
  env: Env,
  accessToken: string,
  userId: string,
  limit: number,
): Promise<{ transactions: CreditTransactionDTO[] }> => {
  const client = createUserScopedClient(env, accessToken);
  const { data, error } = await client
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.message, cause: error });
  }
  return { transactions: (data ?? []) as CreditTransactionDTO[] };
};

type ApplyParams = {
  userId: string;
  delta: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, unknown>;
};

/** Service-role only: ledger + balance update. */
export const applyCredit = async (env: Env, params: ApplyParams): Promise<{ balance: number }> => {
  const admin = createServiceClient(env);
  const { data, error } = await admin.rpc("apply_credit", {
    p_user_id: params.userId,
    p_delta: params.delta,
    p_reason: params.reason,
    p_reference_type: params.referenceType ?? null,
    p_reference_id: params.referenceId ?? null,
    p_metadata: params.metadata ?? {},
  });
  if (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error.message,
      cause: error,
    });
  }
  return { balance: data as number };
};

export const addFundsForUser = async (
  env: Env,
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, unknown>,
): Promise<{ balance: number }> => {
  if (amount <= 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Amount must be positive" });
  }
  return applyCredit(env, {
    userId,
    delta: amount,
    reason,
    referenceType: "topup",
    metadata,
  });
};
