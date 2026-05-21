export type CreditTransactionApi = {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CreditTransactionDTO = {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  referenceType: string | null;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreditTransactionsResponseDTO = {
  transactions: CreditTransactionDTO[];
  total: number;
  page: number;
  limit: number;
};

export class CreditTransactionDTOMapper {
  static toListResponse(params: {
    transactions: CreditTransactionApi[];
    total: number;
    page: number;
    limit: number;
  }): CreditTransactionsResponseDTO {
    return {
      transactions: params.transactions.map(CreditTransactionDTOMapper.toDTO),
      total: params.total,
      page: params.page,
      limit: params.limit,
    };
  }

  static toDTO(api: CreditTransactionApi): CreditTransactionDTO {
    return {
      id: api.id,
      userId: api.user_id,
      amount: api.amount,
      balanceAfter: api.balance_after,
      reason: api.reason,
      referenceType: api.reference_type,
      referenceId: api.reference_id,
      metadata: api.metadata,
      createdAt: api.created_at,
    };
  }

  static toAPI(dto: CreditTransactionDTO): CreditTransactionApi {
    return {
      id: dto.id,
      user_id: dto.userId,
      amount: dto.amount,
      balance_after: dto.balanceAfter,
      reason: dto.reason,
      reference_type: dto.referenceType,
      reference_id: dto.referenceId,
      metadata: dto.metadata,
      created_at: dto.createdAt,
    };
  }
}
