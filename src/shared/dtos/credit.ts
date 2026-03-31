export type CreditTransactionDTO = {
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
