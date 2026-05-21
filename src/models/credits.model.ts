import type { Env } from "@/env";
import { createServiceClient, createUserScopedClient } from "@/lib/supabase";
import type { CreditTransactionApi } from "@/shared/dtos/credit";
import { InternalServerError } from "@/shared/errors";

type ApplyParams = {
  userId: string;
  delta: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, unknown>;
};

export class CreditsModel {
  static async getBalance(
    env: Env,
    accessToken: string,
    userId: string,
  ): Promise<{ balance: number }> {
    const client = createUserScopedClient(env, accessToken);
    const { data, error } = await client
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new InternalServerError(error.message, error);
    return { balance: data?.balance ?? 0 };
  }

  static async listTransactions(
    env: Env,
    accessToken: string,
    userId: string,
    limit: number,
    page: number,
  ): Promise<{ transactions: CreditTransactionApi[]; total: number }> {
    const from = page * limit;
    const to = from + limit - 1;
    const client = createUserScopedClient(env, accessToken);
    const { data, error, count } = await client
      .from("credit_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new InternalServerError(error.message, error);
    return {
      transactions: (data ?? []) as CreditTransactionApi[],
      total: count ?? 0,
    };
  }

  static async applyCredit(
    env: Env,
    params: ApplyParams,
  ): Promise<{ balance: number }> {
    const client = createServiceClient(env);
    const { data, error } = await client.rpc("apply_credit", {
      p_user_id: params.userId,
      p_delta: params.delta,
      p_reason: params.reason,
      p_reference_type: params.referenceType ?? null,
      p_reference_id: params.referenceId ?? null,
      p_metadata: params.metadata ?? {},
    });
    if (error) throw new InternalServerError(error.message, error);
    return { balance: data as number };
  }

  static async upsertBalance(
    env: Env,
    userId: string,
  ): Promise<{ inserted: boolean }> {
    const client = createServiceClient(env);
    const { data, error } = await client
      .from("user_credits")
      .upsert(
        { user_id: userId, balance: 0 },
        { onConflict: "user_id", ignoreDuplicates: true },
      )
      .select("user_id");
    if (error) throw new InternalServerError(error.message, error);
    return { inserted: Boolean(data?.length) };
  }
}
