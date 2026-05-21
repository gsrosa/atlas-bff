import type { Env } from "@/env";
import { CreditsModel } from "@/models/credits.model";
import {
  CreditTransactionDTOMapper,
  type CreditTransactionsResponseDTO,
} from "@/shared/dtos/credit";
import { BadRequestError } from "@/shared/errors";

type ApplyParams = {
  userId: string;
  delta: number;
  reason: string;
  referenceType?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, unknown>;
};

export class CreditsService {
  static async getBalance(
    env: Env,
    accessToken: string,
    userId: string,
  ): Promise<{ balance: number }> {
    return CreditsModel.getBalance(env, accessToken, userId);
  }

  static async listTransactions(
    env: Env,
    accessToken: string,
    userId: string,
    limit: number,
    page: number,
  ): Promise<CreditTransactionsResponseDTO> {
    const { transactions, total } = await CreditsModel.listTransactions(
      env,
      accessToken,
      userId,
      limit,
      page,
    );
    return CreditTransactionDTOMapper.toListResponse({
      transactions,
      total,
      page,
      limit,
    });
  }

  /** Service-role only: ledger + balance update. */
  static async applyCredit(
    env: Env,
    params: ApplyParams,
  ): Promise<{ balance: number }> {
    return CreditsModel.applyCredit(env, params);
  }

  static async addFundsForUser(
    env: Env,
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, unknown>,
  ): Promise<{ balance: number }> {
    if (amount <= 0) {
      throw new BadRequestError("Amount must be positive");
    }
    return CreditsService.applyCredit(env, {
      userId,
      delta: amount,
      reason,
      referenceType: "topup",
      metadata,
    });
  }
}
