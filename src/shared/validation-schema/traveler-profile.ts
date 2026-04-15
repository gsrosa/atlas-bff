import { z } from "zod";

export const dietTypeSchema = z.enum([
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "flexitarian",
  "halal",
  "kosher",
]);

export const languageComfortSchema = z.enum([
  "english-only",
  "gestures-ok",
  "adventurous",
  "multilingual",
]);

export const discoveryStyleSchema = z.enum(["researcher", "loose-planner", "wanderer"]);

export const budgetStyleSchema = z.enum(["budget", "value", "comfort", "luxury"]);

export const accommodationTypeSchema = z.enum([
  "hostel",
  "budget-hotel",
  "mid-hotel",
  "boutique",
  "luxury",
  "airbnb",
  "camping",
]);

export const tripMemorableBySchema = z.enum([
  "transcendent-experience",
  "consistent-quality",
  "unexpected-discoveries",
  "food-drink",
  "human-connections",
  "being-lost-in-place",
]);

export const rating15Schema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const climateToleranceSchema = z.enum(["heat", "mild", "cold", "any"]);

export const crowdToleranceSchema = z.enum(["fine", "mixed", "avoids"]);

export const localInteractionSchema = z.enum(["loves-it", "sometimes", "observer"]);

export const travelPersonalitySchema = z.enum(["introvert", "extrovert", "balanced"]);

export const ecoConsciousnessSchema = z.enum(["priority", "when-convenient", "not-a-factor"]);

export const fitnessLevelSchema = z.enum(["sedentary", "active", "athletic"]);

export const connectivityNeedsSchema = z.enum(["always-connected", "balanced", "disconnects"]);

/** Full profile shape (for docs / future strict save). Stored document may be partial. */
export const travelerProfileSchema = z.object({
  diet: dietTypeSchema,
  foodAdventurousness: rating15Schema,
  foodImportance: rating15Schema,
  restaurantStyles: z.array(z.string()).min(1),
  drinksAlcohol: z.boolean(),
  foodAllergies: z.string().optional(),

  urbanVsNature: rating15Schema,
  landscapeTypes: z.array(z.string()),
  climateTolerance: climateToleranceSchema,
  altitudeSensitive: z.boolean(),
  stimulationPreference: rating15Schema,

  discoveryStyle: discoveryStyleSchema,
  depthVsBreadth: rating15Schema,
  crowdTolerance: crowdToleranceSchema,

  localInteraction: localInteractionSchema,
  travelPersonality: travelPersonalitySchema,

  interests: z.array(z.string()).min(1),
  photographyImportance: rating15Schema,

  budgetStyle: budgetStyleSchema,
  accommodationStyles: z.array(accommodationTypeSchema).min(1),
  accommodationMustHaves: z.array(z.string()),

  ecoConsciousness: ecoConsciousnessSchema,
  ethicalLimits: z.array(z.string()),

  fitnessLevel: fitnessLevelSchema,
  connectivityNeeds: connectivityNeedsSchema,
  languageComfort: languageComfortSchema,
  wellnessImportance: rating15Schema,

  tripMemorableBy: tripMemorableBySchema,
});

export type TravelerProfile = z.infer<typeof travelerProfileSchema>;

/** PATCH body: any subset of fields; arrays replace when sent. */
export const patchTravelerProfileInputSchema = z
  .object({
    diet: dietTypeSchema.optional(),
    foodAdventurousness: rating15Schema.optional(),
    foodImportance: rating15Schema.optional(),
    restaurantStyles: z.array(z.string()).optional(),
    drinksAlcohol: z.boolean().optional(),
    foodAllergies: z.string().optional().nullable(),

    urbanVsNature: rating15Schema.optional(),
    landscapeTypes: z.array(z.string()).optional(),
    climateTolerance: climateToleranceSchema.optional(),
    altitudeSensitive: z.boolean().optional(),
    stimulationPreference: rating15Schema.optional(),

    discoveryStyle: discoveryStyleSchema.optional(),
    depthVsBreadth: rating15Schema.optional(),
    crowdTolerance: crowdToleranceSchema.optional(),

    localInteraction: localInteractionSchema.optional(),
    travelPersonality: travelPersonalitySchema.optional(),

    interests: z.array(z.string()).optional(),
    photographyImportance: rating15Schema.optional(),

    budgetStyle: budgetStyleSchema.optional(),
    accommodationStyles: z.array(accommodationTypeSchema).optional(),
    accommodationMustHaves: z.array(z.string()).optional(),

    ecoConsciousness: ecoConsciousnessSchema.optional(),
    ethicalLimits: z.array(z.string()).optional(),

    fitnessLevel: fitnessLevelSchema.optional(),
    connectivityNeeds: connectivityNeedsSchema.optional(),
    languageComfort: languageComfortSchema.optional(),
    wellnessImportance: rating15Schema.optional(),

    tripMemorableBy: tripMemorableBySchema.optional(),
  })
  .strict();

export type PatchTravelerProfileInput = z.infer<typeof patchTravelerProfileInputSchema>;

/** Keys used for completeness (all fields in TravelerProfile). */
export const TRAVELER_PROFILE_KEYS = [
  "diet",
  "foodAdventurousness",
  "foodImportance",
  "restaurantStyles",
  "drinksAlcohol",
  "foodAllergies",
  "urbanVsNature",
  "landscapeTypes",
  "climateTolerance",
  "altitudeSensitive",
  "stimulationPreference",
  "discoveryStyle",
  "depthVsBreadth",
  "crowdTolerance",
  "localInteraction",
  "travelPersonality",
  "interests",
  "photographyImportance",
  "budgetStyle",
  "accommodationStyles",
  "accommodationMustHaves",
  "ecoConsciousness",
  "ethicalLimits",
  "fitnessLevel",
  "connectivityNeeds",
  "languageComfort",
  "wellnessImportance",
  "tripMemorableBy",
] as const satisfies readonly (keyof TravelerProfile)[];

export const TIER1_TRAVELER_KEYS = [
  "diet",
  "foodAdventurousness",
  "urbanVsNature",
  "stimulationPreference",
  "discoveryStyle",
  "interests",
  "budgetStyle",
  "fitnessLevel",
  "tripMemorableBy",
  "languageComfort",
] as const;
