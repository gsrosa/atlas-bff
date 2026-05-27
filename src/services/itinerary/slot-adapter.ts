import type {
  ItinerarySlot,
  TripAttraction,
  TripDayMeal,
  TripPlanOutput,
  TripTransportLeg,
} from "@/shared/validation-schema/ai-output";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

type MealType = (typeof MEAL_TYPES)[number];

export const adaptSlotsForCompatibility = (
  plan: TripPlanOutput,
): TripPlanOutput => ({
  ...plan,
  days: plan.days.map((day) => {
    if (!day.slots?.length) return day;

    const slots = normalizeSlotIds(day.dayNumber, day.slots);

    return {
      ...day,
      slots,
      attractions: slotsToAttractions(slots),
      meals: slotsToMeals(slots),
      transportation: slotsToTransportation(slots),
    };
  }),
});

const normalizeSlotIds = (
  dayNumber: number,
  slots: ItinerarySlot[],
): ItinerarySlot[] => {
  const seen = new Set<string>();

  return slots.map((slot, index) => {
    const baseId = slot.id.trim() || buildSlotId(dayNumber, slot, index);
    const id = ensureUniqueId(baseId, seen);
    seen.add(id);

    return {
      ...slot,
      id,
      dayNumber,
    };
  });
};

const slotsToAttractions = (slots: ItinerarySlot[]): TripAttraction[] =>
  slots
    .filter((slot) => slot.kind === "attraction" || slot.kind === "activity")
    .map((slot) => {
      const price = priceFromSlot(slot);

      return {
        name: slot.resolvedPlace?.name ?? slot.title,
        address: slot.resolvedPlace?.address ?? slot.area,
        category: slot.kind,
        notes: slot.notes,
        price,
        averageMinutesSpent: slot.durationMinutes,
      };
    });

const slotsToMeals = (slots: ItinerarySlot[]): TripDayMeal[] | undefined => {
  const meals = slots
    .filter((slot) => slot.kind === "meal")
    .map((slot) => ({
      name: slot.resolvedPlace?.name ?? slot.title,
      type: getMealType(slot),
      notes: slot.notes,
    }));

  return meals.length > 0 ? meals : undefined;
};

const slotsToTransportation = (
  slots: ItinerarySlot[],
): TripTransportLeg[] | undefined => {
  const transports = slots
    .filter((slot) => slot.kind === "transport")
    .map((slot, index) => ({
      from: findPreviousStopTitle(slots, slot.id) ?? `Stop ${index + 1}`,
      to: slot.title,
      mode: slot.routeFromPrevious?.recommendedMode ?? "transport",
      durationMinutes:
        slot.durationMinutes ??
        slot.routeFromPrevious?.modes[
          slot.routeFromPrevious.recommendedMode ?? "driving"
        ]?.durationMinutes,
      notes: slot.notes,
    }));

  return transports.length > 0 ? transports : undefined;
};

const priceFromSlot = (
  slot: ItinerarySlot,
): TripAttraction["price"] | undefined => {
  const price = slot.estimatedPrice;
  if (!price) return undefined;

  const amount = price.amount ?? price.min ?? price.max;
  if (amount === undefined) return undefined;

  return { amount, currency: price.currency };
};

const getMealType = (slot: ItinerarySlot): MealType => {
  if (slot.resolve?.slot && isMealType(slot.resolve.slot)) return slot.resolve.slot;

  const hour = Number(slot.startTime.slice(0, 2));
  if (Number.isFinite(hour)) {
    if (hour < 11) return "breakfast";
    if (hour < 16) return "lunch";
    if (hour < 18) return "snack";
  }

  return "dinner";
};

const isMealType = (value: string): value is MealType =>
  MEAL_TYPES.includes(value as MealType);

const findPreviousStopTitle = (
  slots: ItinerarySlot[],
  slotId: string,
): string | undefined => {
  const index = slots.findIndex((slot) => slot.id === slotId);
  if (index <= 0) return undefined;

  return slots[index - 1]?.title;
};

const buildSlotId = (
  dayNumber: number,
  slot: ItinerarySlot,
  index: number,
): string =>
  [
    "day",
    String(dayNumber),
    slot.startTime.replace(/[^0-9]/g, "") || String(index + 1),
    slugify(slot.title),
  ]
    .filter(Boolean)
    .join("-");

const ensureUniqueId = (id: string, seen: Set<string>): string => {
  if (!seen.has(id)) return id;

  let suffix = 2;
  let next = `${id}-${suffix}`;
  while (seen.has(next)) {
    suffix += 1;
    next = `${id}-${suffix}`;
  }
  return next;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
