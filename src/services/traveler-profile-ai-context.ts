import type { TravelerProfile } from "@/shared/validation-schema/traveler-profile";

type PartialProfile = Partial<TravelerProfile> & Record<string, unknown>;

function fmt(value: string | string[] | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(", ") || "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function dietLabel(d: string | undefined): string {
  if (!d) return "";
  const map: Record<string, string> = {
    omnivore: "Omnivore",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    flexitarian: "Flexitarian",
    halal: "Halal",
    kosher: "Kosher",
  };
  return map[d] ?? d;
}

function urbanNatureLabel(v: number | undefined): string {
  if (v === undefined) return "";
  if (v <= 2) return "City-leaning";
  if (v >= 4) return "Nature-leaning";
  return "Balanced city/nature";
}

function stimulationLabel(v: number | undefined): string {
  if (v === undefined) return "";
  if (v <= 2) return "Prefers calm environments";
  if (v >= 4) return "Enjoys lively, high-energy places";
  return "Moderate stimulation";
}

/**
 * Serializes stored traveler preferences + trip answer summary for the LLM system/user prompt.
 * `tripSummaryText` should be the existing buildAnswerSummary output (and optional AI follow-ups).
 */
export function buildAIContextBlock(profile: PartialProfile | null | undefined, tripSummaryText: string): string {
  if (!profile || Object.keys(profile).length === 0) {
    return tripSummaryText.trim();
  }

  const p = profile;
  const allergies = typeof p.foodAllergies === "string" && p.foodAllergies.trim() ? p.foodAllergies.trim() : "";

  const userBlock = [
    "[User Profile]",
    p.diet ? `Diet: ${dietLabel(String(p.diet))}.` : "",
    allergies ? `Allergies/restrictions: ${allergies}.` : "",
    p.foodAdventurousness !== undefined
      ? `Food adventurousness: ${p.foodAdventurousness}/5.`
      : "",
    p.foodImportance !== undefined ? `Food importance on trips: ${p.foodImportance}/5.` : "",
    p.restaurantStyles?.length ? `Restaurant preferences: ${fmt(p.restaurantStyles)}.` : "",
    p.drinksAlcohol !== undefined ? `Drinks alcohol: ${fmt(p.drinksAlcohol)}.` : "",
    p.urbanVsNature !== undefined ? `Environment: ${urbanNatureLabel(p.urbanVsNature as number)}.` : "",
    p.landscapeTypes?.length ? `Preferred landscapes: ${fmt(p.landscapeTypes)}.` : "",
    p.climateTolerance ? `Climate tolerance: ${p.climateTolerance}.` : "",
    p.altitudeSensitive !== undefined ? `Altitude sensitive: ${fmt(p.altitudeSensitive)}.` : "",
    p.stimulationPreference !== undefined
      ? `Stimulation preference: ${stimulationLabel(p.stimulationPreference as number)}.`
      : "",
    p.discoveryStyle ? `Exploration style: ${p.discoveryStyle}.` : "",
    p.depthVsBreadth !== undefined ? `Depth vs breadth (1=deep, 5=broad): ${p.depthVsBreadth}/5.` : "",
    p.crowdTolerance ? `Crowd tolerance: ${p.crowdTolerance}.` : "",
    p.travelPersonality ? `Travel personality: ${p.travelPersonality}.` : "",
    p.localInteraction ? `Local interaction: ${p.localInteraction}.` : "",
    p.interests?.length ? `Core interests: ${fmt(p.interests)}.` : "",
    p.photographyImportance !== undefined
      ? `Photography importance: ${p.photographyImportance}/5.`
      : "",
    p.budgetStyle ? `Budget philosophy: ${p.budgetStyle}.` : "",
    p.accommodationStyles?.length ? `Accommodation types: ${fmt(p.accommodationStyles as string[])}.` : "",
    p.accommodationMustHaves?.length ? `Accommodation must-haves: ${fmt(p.accommodationMustHaves)}.` : "",
    p.fitnessLevel ? `Fitness level: ${p.fitnessLevel}.` : "",
    p.connectivityNeeds ? `Connectivity: ${p.connectivityNeeds}.` : "",
    p.languageComfort ? `Language comfort: ${p.languageComfort}.` : "",
    p.wellnessImportance !== undefined ? `Wellness importance: ${p.wellnessImportance}/5.` : "",
    p.ecoConsciousness ? `Sustainability stance: ${p.ecoConsciousness}.` : "",
    p.ethicalLimits?.length ? `Ethical limits: ${fmt(p.ethicalLimits)}.` : "",
    p.tripMemorableBy ? `What makes trips unforgettable: ${p.tripMemorableBy}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const tripBlock = tripSummaryText.trim() ? `\n[This Trip]\n${tripSummaryText.trim()}` : "";

  const diet = dietLabel(String(p.diet));
  const effectiveDietary = [diet, allergies].filter(Boolean).join(" — ");

  const resolved =
    effectiveDietary || tripSummaryText.trim()
      ? `\n[Resolved constraints]\nEffective dietary notes: ${effectiveDietary || "Not specified beyond trip answers."}`
      : "";

  const core = [userBlock, tripBlock, resolved].filter(Boolean).join("\n");
  return core.trim();
}
