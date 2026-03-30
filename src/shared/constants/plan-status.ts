export const PLAN_STATUSES = ["draft", "completed", "archived"] as const;

export type PlanStatus = (typeof PLAN_STATUSES)[number];
