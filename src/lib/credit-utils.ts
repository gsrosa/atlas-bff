/**
 * Returns the credit cost for generating a trip plan based on the number of days.
 * Returns null if the day count exceeds the maximum allowed (20).
 */
export const PLAN_MAX_DAYS = 20;

export const creditCostForDays = (days: number): number | null => {
  if (days <= 0) return 5;
  if (days <= 7) return 5;
  if (days <= 12) return 8;
  if (days <= 15) return 12;
  if (days <= PLAN_MAX_DAYS) return 18;
  return null; // exceeds max — blocked
};

/**
 * Returns the credit cost for modifying (adapting) a trip plan based on the number of days.
 * Tiers: 1-7=3, 8-12=4, 13-15=5, 16-20=7.
 */
export const modifyCostForDays = (days: number): number => {
  if (days <= 7) return 3;
  if (days <= 12) return 4;
  if (days <= 15) return 5;
  return 7;
};

/** Derive day count from the AnswerMap (same logic as buildAnswerSummary). */
export const deriveDayCountFromAnswers = (
  answers: Record<string, string | string[] | undefined>,
): number | null => {
  const dateRange = answers["exact-date-range"];
  if (typeof dateRange === "string") {
    const [startStr, endStr] = dateRange.split("|");
    if (startStr && endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
  }
  const tripLength = answers["trip-length"];
  if (tripLength === "custom-days") {
    const exactDays = answers["exact-days"];
    if (typeof exactDays === "string") {
      const n = parseInt(exactDays, 10);
      if (!isNaN(n)) return n;
    }
  }
  const slugMap: Record<string, number> = {
    weekend: 2,
    short: 5,
    week: 7,
    long: 12,
    extended: 15,
  };
  if (typeof tripLength === "string" && tripLength in slugMap) {
    return slugMap[tripLength]!;
  }
  return null;
};

/** Derive day count from hotel check-in/check-out dates (sum of all stays). */
export const deriveDayCountFromHotels = (
  hotels: Array<{ checkinDate?: string; checkoutDate?: string }>,
): number | null => {
  let total = 0;
  let counted = false;
  for (const h of hotels) {
    if (!h.checkinDate || !h.checkoutDate) continue;
    const ci = new Date(h.checkinDate);
    const co = new Date(h.checkoutDate);
    if (isNaN(ci.getTime()) || isNaN(co.getTime())) continue;
    const nights = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    if (nights > 0) { total += nights; counted = true; }
  }
  return counted ? total : null;
};
