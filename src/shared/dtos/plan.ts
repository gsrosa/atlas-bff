import type { PlanStatus } from "@/shared/constants/plan-status";

export type PlanDTO = {
  id: string;
  user_id: string;
  title: string | null;
  status: PlanStatus;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
