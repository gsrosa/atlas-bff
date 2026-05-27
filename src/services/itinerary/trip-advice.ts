import type { TripAdvice, TripPlanOutput } from "@/shared/validation-schema/ai-output";

export const normalizeTripAdvice = (plan: TripPlanOutput): TripPlanOutput => {
  const advice = plan.tripAdvice ?? buildFallbackAdvice(plan);
  const cities = new Set(plan.days.map((day) => day.city).filter(Boolean));

  if (cities.size <= 1 && advice.shouldSplitStay) {
    return {
      ...plan,
      tripAdvice: {
        ...advice,
        shouldSplitStay: false,
        splitStayAdvice: undefined,
      },
    };
  }

  return { ...plan, tripAdvice: advice };
};

const buildFallbackAdvice = (plan: TripPlanOutput): TripAdvice => {
  const firstDay = plan.days[0];
  const area = firstDay?.lodging?.trim() || firstDay?.city || plan.destination;

  return {
    bestAreasToStay: [
      {
        area,
        reason: "Closest practical base for the first planned days.",
      },
    ],
    shouldSplitStay: false,
  };
};
