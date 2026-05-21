import { AiQualityError } from "@/shared/errors";
import type { TripPlanOutput } from "@/shared/validation-schema/ai-output";

export type { AiQualityError };

export interface TripPlanQualityOptions {
  expectedDays?: number | null;
}

const GENERIC_LODGING_VALUES = new Set([
  "accommodation",
  "airbnb",
  "guesthouse",
  "hotel",
  "hostel",
  "lodging",
  "resort",
  "stay",
]);

const LOCATION_HINT_PATTERN = /\b(in|near|around|at|by|within)\b|[,;-]/i;

export function assertTripPlanQuality(
  plan: TripPlanOutput,
  opts: TripPlanQualityOptions = {},
): void {
  const issues: string[] = [];
  const expectedDays = opts.expectedDays ?? null;

  if (expectedDays !== null && plan.days.length !== expectedDays) {
    issues.push(`expected ${expectedDays} days, got ${plan.days.length}`);
  }

  for (const day of plan.days) {
    const label = `day ${day.dayNumber}`;
    if (!day.city.trim()) {
      issues.push(`${label} is missing city`);
    }

    if (isGenericLodging(day.lodging)) {
      issues.push(`${label} has generic lodging`);
    }
  }

  if (issues.length > 0) {
    throw new AiQualityError(issues);
  }
}

function isGenericLodging(lodging: string | undefined): boolean {
  const value = lodging?.trim();
  if (!value) return true;

  const normalized = value.toLowerCase().replace(/\s+/g, " ");
  if (GENERIC_LODGING_VALUES.has(normalized)) return true;

  const strippedArticle = normalized.replace(/^(a|an|the)\s+/, "");
  if (GENERIC_LODGING_VALUES.has(strippedArticle)) return true;

  const words = strippedArticle.split(" ");
  const includesGenericType = words.some((word) =>
    GENERIC_LODGING_VALUES.has(word),
  );

  return (
    includesGenericType &&
    words.length <= 3 &&
    !LOCATION_HINT_PATTERN.test(value)
  );
}
