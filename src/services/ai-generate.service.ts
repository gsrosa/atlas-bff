import { generateObject } from "ai";
import type { ZodSchema } from "zod";

import { buildAiModel, NO_THINKING } from "@/ai/client";
import { logAiCall } from "@/ai/logger";
import type { Env } from "@/env/env";
import {
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
} from "@/lib/credit-utils";
import { getTravelerPreferences } from "@/services/traveler-profile.service";
import { buildAIContextBlock } from "@/services/traveler-profile-ai-context";
import {
  type ChecklistOutput,
  checklistOutputSchema,
  type HotelEnrichOutput,
  hotelEnrichOutputSchema,
  type TripPlanOutput,
  tripPlanOutputSchema,
} from "@/shared/validation-schema/ai-output";
import type { AiQuestionInput, AnswerMap, TripDetails } from "@/shared/validation-schema/planner-input";

// ─── Logged generateObject wrapper ───────────────────────────────────────────

async function generate<T>(opts: {
  env: Env;
  endpoint: string;
  userId?: string;
  schema: ZodSchema<T>;
  system: string;
  prompt: string;
  maxOutputTokens: number;
  temperature: number;
}): Promise<T> {
  const start = Date.now();
  try {
    const { object, usage } = await generateObject({
      model: buildAiModel(opts.env),
      providerOptions: NO_THINKING,
      schema: opts.schema,
      system: opts.system,
      prompt: opts.prompt,
      maxOutputTokens: opts.maxOutputTokens,
      temperature: opts.temperature,
    });
    logAiCall({
      correlationId: crypto.randomUUID(),
      endpoint: opts.endpoint,
      model: opts.env.GEMINI_MODEL,
      userId: opts.userId,
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      latencyMs: Date.now() - start,
      success: true,
      zodValid: true,
    });
    return object;
  } catch (err) {
    logAiCall({
      correlationId: crypto.randomUUID(),
      endpoint: opts.endpoint,
      model: opts.env.GEMINI_MODEL,
      userId: opts.userId,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start,
      success: false,
      zodValid: false,
      errorCode: err instanceof Error ? err.message.slice(0, 120) : "unknown",
    });
    throw err;
  }
}

// ─── Prompt helpers ───────────────────────────────────────────────────────────

function fmt(value: string | string[] | undefined): string {
  if (!value) return "Not specified";
  if (Array.isArray(value)) return value.join(", ") || "Not specified";
  return value;
}

interface ParsedDateRange {
  start: Date;
  end: Date;
  days: number;
  startStr: string;
  endStr: string;
}

function parseDateRange(value: string | string[] | undefined): ParsedDateRange | null {
  if (!value || typeof value !== "string") return null;
  const [startStr, endStr] = value.split("|");
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return { start, end, days, startStr, endStr };
}

function isNearFuture(date: Date, withinDays = 45): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
}

function buildAnswerSummary(answers: AnswerMap, tripDetails?: TripDetails): string {
  const dateRange = parseDateRange(answers["exact-date-range"]);

  let tripLength: string;
  let travelDates: string;
  let weatherNote = "";

  if (dateRange) {
    tripLength = `${dateRange.days} days (exact: ${dateRange.startStr} → ${dateRange.endStr})`;
    travelDates = `Exact dates: ${dateRange.startStr} → ${dateRange.endStr}`;
    if (isNearFuture(dateRange.start)) {
      weatherNote =
        `- ⚠️ WEATHER FORECAST: Trip starts within 45 days — use real-world forecast data for ` +
        `${dateRange.startStr} to ${dateRange.endStr} when planning outdoor activities. ` +
        `Flag any days with historically poor weather for the destination.`;
    }
  } else {
    tripLength =
      answers["trip-length"] === "custom-days" && typeof answers["exact-days"] === "string"
        ? `custom (${answers["exact-days"]} days)`
        : fmt(answers["trip-length"]);
    travelDates = fmt(answers["when-traveling"]);
  }

  const dailyInvestment =
    answers["daily-investment"] === "custom-budget" &&
    typeof answers["daily-investment-custom"] === "string"
      ? `$${answers["daily-investment-custom"]} / day`
      : fmt(answers["daily-investment"]);

  const accommodationTypes = fmt(answers["accommodation-types"]);
  const hasAccommodation = accommodationTypes !== "Not specified";

  const lines = [
    `- Who's embarking: ${fmt(answers["who-embarking"])}`,
    `- Destination mode: ${fmt(answers["destination-mode"])}`,
    `- Destination in mind: ${fmt(answers["destination-in-mind"])}`,
    `- Trip length: ${tripLength}`,
    `- When traveling: ${travelDates}`,
    `- Daily investment (all-in / day): ${dailyInvestment}`,
    `- Climate preference: ${fmt(answers["climate"])}`,
    `- Regions: ${fmt(answers["regions"])}${answers["country-name"] ? ` — specific country: ${answers["country-name"]}` : ""}`,
    `- Accommodation types: ${hasAccommodation ? accommodationTypes : "Not specified — recommend best-fit options per area"}`,
    `- Travel pace: ${fmt(answers["travel-pace"])}`,
    `- Special requirements: ${fmt(answers["special-requirements"]) || "None"}`,
    `- Flight tickets booked: ${fmt(answers["has-flight-tickets"])}`,
    `- Flight details: ${fmt(answers["flight-ticket-details"])}`,
  ];

  if (weatherNote) lines.push(weatherNote);
  appendTripDetails(lines, tripDetails);
  return lines.join("\n");
}

function appendTripDetails(lines: string[], tripDetails: TripDetails | undefined): void {
  if (!tripDetails) return;
  if (tripDetails.hotels?.length) {
    const summary = tripDetails.hotels
      .map((h) => {
        const dates =
          h.checkinDate && h.checkoutDate
            ? ` (check-in: ${h.checkinDate}, check-out: ${h.checkoutDate})`
            : "";
        const addr = h.address?.trim() ? `, address: ${h.address.trim()}` : "";
        return `${h.name}${dates}${addr}`;
      })
      .join("; ");
    lines.push(`- Pre-booked hotels: ${summary}`);
  }
  if (tripDetails.flights?.length) {
    const summary = tripDetails.flights
      .map((f) =>
        f.departureDate && f.arrivalDate
          ? `${f.flightNumber} (${f.departureDate} → ${f.arrivalDate})`
          : f.departureDate
            ? `${f.flightNumber} (departs ${f.departureDate})`
            : f.flightNumber,
      )
      .join("; ");
    lines.push(`- Pre-booked flights: ${summary}`);
  }
}

function buildAiAnswerSummary(questions: AiQuestionInput[], answers: AnswerMap): string {
  return questions
    .map((q) => `- ${q.question}: ${fmt(answers[q.id])}`)
    .join("\n");
}

// ─── System prompts ───────────────────────────────────────────────────────────

const CHECKLIST_SYSTEM_PROMPT = `You are Atlas AI, an expert travel planner.
The traveller has already completed a fixed questionnaire (group, trip length, budget, climate, regions, accommodation types, pace, special needs, and when they plan to travel).

Your job: generate **5 to 7** follow-up questions focused mainly on **activities, experiences, and priorities** — not on repeating what they already told you.

Rules:
- Return ONLY valid JSON: { "questions": AiQuestion[] }
- AiQuestion shape: { "id": string, "question": string, "type": "single"|"multi"|"text", "options": string[]|undefined, "required": boolean optional }
- At least **half** of the questions must directly address activities or types of experiences (e.g. hiking intensity, museums vs nightlife, water sports, cultural depth, wildlife, photography, food tours).
- Use **when they plan to go** + **climate** + **regions** to infer season and weather — ask about seasonal activities or alternatives where relevant.
- Tie suggestions to their **travel pace** (stops per day) and **accommodation mix**.
- **Accommodation & lodging**: If the traveller did NOT specify accommodation types (value is "Not specified"), include one question asking about preferred stay style or neighbourhood (e.g. "Would you prefer to stay in a central neighbourhood for easy access, or a quieter/local area?"). If they already provided accommodation types, do NOT ask about it again.
- Use type "single" for mutually exclusive choices (max 4 options)
- Use type "multi" for non-exclusive choices (max 6 options)
- Use type "text" for at most **one** question if free text is essential
- Do not duplicate base questionnaire topics (who, trip length, daily budget, climate pick, region list, pace, special requirements text, travel window)
- Each id must be a unique slug (e.g. "activity-hiking-level")
- options must be present and non-empty for "single" and "multi"
- Keep questions short; option labels 1–4 words
- No markdown, no code fences, no text outside the single JSON object`;

const TRIP_PLAN_SYSTEM_PROMPT = `You are Atlas AI, an expert travel planner with deep knowledge of destinations worldwide.
Generate a complete, practical trip plan based on the traveller's preferences.

Return ONLY valid JSON matching this exact schema (types described in TypeScript-like form):
{
  "destination": string,
  "country": string,
  "bestTravelMonth": string,
  "weather": {
    "bestMonth": string,
    "summary": string,
    "temperatureRangeCelsius": string
  },
  "days": [
    {
      "dayNumber": number,
      "dayTitle": string,
      "city": string,
      "country": string (optional),
      "region": string (optional),
      "summary": string (optional, one-line overview of the day),
      "attractions": [
        {
          "name": string,
          "address": string (strongly preferred — full street-level address, e.g. "Rua Augusta 1500, São Paulo" or "10 Downing St, London SW1A 2AA"),
          "category": string (optional, e.g. museum, viewpoint, hike),
          "notes": string (optional),
          "price": { "amount": number, "currency": string } (optional),
          "averageMinutesSpent": number (optional, typical visit length in minutes),
          "openingHours": string (optional),
          "websiteUrl": string (optional, full URL if known)
        }
      ],
      "meals": [ { "name": string, "type": "breakfast"|"lunch"|"dinner"|"snack", "notes": string (optional) } ] (optional),
      "transportation": [ { "from": string, "to": string, "mode": string, "durationMinutes": number (optional), "notes": string (optional) } ] (optional),
      "lodging": string (optional)
    }
  ],
  "paidAttractions": [
    {
      "name": string,
      "category": string,
      "estimatedPriceUsd": string,
      "notes": string (optional)
    }
  ],
  "meta": object (optional)
}

Rules:
- **Every day must set "city"** explicitly — multi-city trips must change city across days as appropriate.
- **Each "dayNumber" must be unique** — the "days" array must contain exactly one object per day. Never emit two objects with the same "dayNumber". Every field (attractions, meals, transportation, lodging) belongs in that single object.
- **Attractions** are the primary content per day: realistic names, **always include a full street-level address** (street number, street name, city — e.g. "Av. Paulista, 1578, São Paulo"), optional price and **averageMinutesSpent** (minutes, not hours). The address is critical for map routing — omit only if the place has no fixed address (e.g. a hiking trail; use a descriptive location instead).
- Choose destination(s) that fit **climate**, **regions**, **when-traveling**, and **daily-investment**. Multi-region: logical routing across days with clear city labels.
- If the traveller provided a destination in mind, prioritise it unless constraints conflict.
- Trip length defaults: weekend=2, short=5, week=7, long=12, extended=15 days. If the profile includes exact dates or a custom day count, use that exact number of days.
- **Travel pace**: relaxed → fewer, deeper attractions; intensive → more stops with shorter averageMinutesSpent.
- Weather must align with climate + travel window. If a WEATHER FORECAST note is in the profile, use real forecast data for those dates.
- "temperatureRangeCelsius" must use the Unicode degree symbol: e.g. "20–28°C". Never use escape sequences or ASCII approximations.
- paidAttractions: fee-based experiences with realistic USD strings and short notes.
- JSON only — no markdown, no code fences, no extra prose outside the JSON object.
- Use follow-up answers heavily for activities and priorities.

## Lodging strategy (critical)
- **Group consecutive days by geographic proximity.** If days 1-3 have attractions in the same area/neighbourhood, assign the same "lodging" value to all three — minimise check-in churn.
- The "lodging" field must be specific: accommodation type + neighbourhood/area (e.g. "Mid-range hotel in Shinjuku, Tokyo" or "Boutique hostel in El Born, Barcelona"). Never leave it generic like "hotel".
- When the itinerary shifts to a new area (>30 min travel from previous base), plan a hotel move on the transition day and add a "transportation" leg noting the move (e.g. "Check out and transfer to new hotel in X").
- If the traveller did NOT specify accommodation types, recommend the best-value option for their budget in each area and explain the choice briefly in the "lodging" field.
- Aim for the fewest hotel changes possible without sacrificing proximity to daily attractions.
- For multi-city trips, each city block should have its own lodging suggestion with a specific neighbourhood recommendation.`;

// ─── Service functions ────────────────────────────────────────────────────────

export const generateChecklistFromAnswers = async (
  env: Env,
  answers: AnswerMap,
  opts?: { accessToken?: string; userId?: string },
  tripDetails?: TripDetails,
): Promise<ChecklistOutput> => {
  const baseSummary = buildAnswerSummary(answers, tripDetails);
  let mergedContext = buildAIContextBlock(null, baseSummary);
  if (opts?.accessToken && opts?.userId) {
    try {
      const { preferences } = await getTravelerPreferences(env, opts.accessToken, opts.userId);
      mergedContext = buildAIContextBlock(preferences, baseSummary);
    } catch {
      mergedContext = buildAIContextBlock(null, baseSummary);
    }
  }
  const userPrompt =
    `${mergedContext}\n\n` +
    `Generate 5–7 personalised follow-up questions.\n\n` +
    `Priorities:\n` +
    `1) Activities and experiences that fit their timing, climate, and regions.\n` +
    `2) Must-haves vs things to avoid for this specific trip.\n` +
    `3) Physical level or comfort where it affects activity choice.\n` +
    `4) Any gap you need to build a coherent day-by-day plan (still activity-leaning).\n\n` +
    `Do not re-ask the base fields.`;

  return generate({
    env,
    endpoint: "checklist",
    userId: opts?.userId,
    schema: checklistOutputSchema,
    system: CHECKLIST_SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 8192,
    temperature: 0.7,
  });
};

export const generateTripPlanFromAnswers = async (
  env: Env,
  answers: AnswerMap,
  aiQuestions: AiQuestionInput[],
  aiAnswers: AnswerMap,
  opts?: { accessToken?: string; userId?: string },
  tripDetails?: TripDetails,
): Promise<TripPlanOutput> => {
  const aiSummary = buildAiAnswerSummary(aiQuestions, aiAnswers);
  const baseSummary = buildAnswerSummary(answers, tripDetails);
  const tripCore =
    `BASE PREFERENCES:\n${baseSummary}\n\n` +
    `PERSONALISED DETAILS (from follow-up):\n${aiSummary || "None provided"}`;

  let mergedContext = tripCore;
  if (opts?.accessToken && opts?.userId) {
    try {
      const { preferences } = await getTravelerPreferences(env, opts.accessToken, opts.userId);
      mergedContext = buildAIContextBlock(preferences, tripCore);
    } catch {
      mergedContext = tripCore;
    }
  }

  const hotelDays = tripDetails?.hotels ? deriveDayCountFromHotels(tripDetails.hotels) : null;
  const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);
  const dayInstruction = effectiveDays
    ? `\nGenerate EXACTLY ${effectiveDays} days — the "days" array must have exactly ${effectiveDays} objects.`
    : "";

  const userPrompt =
    `Create a complete trip plan for the following traveller:\n\n` +
    `${mergedContext}\n\n` +
    `Use all of the above to select the best destination and build the full day-by-day plan.${dayInstruction}`;

  return generate({
    env,
    endpoint: "trip",
    userId: opts?.userId,
    schema: tripPlanOutputSchema,
    system: TRIP_PLAN_SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 32768,
    temperature: 0.7,
  });
};

// ─── Legacy raw-prompt functions (used by /edit) ──────────────────────────────

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export const editTripPlan = async (
  env: Env,
  opts: GenerateOptions,
): Promise<TripPlanOutput> => {
  return generate({
    env,
    endpoint: "edit",
    schema: tripPlanOutputSchema,
    system: opts.systemPrompt,
    prompt: opts.userPrompt,
    maxOutputTokens: opts.maxTokens ?? 32768,
    temperature: opts.temperature ?? 0.3,
  });
};

// ─── Hotel enrichment ────────────────────────────────────────────────────────

const HOTEL_ENRICH_SYSTEM_PROMPT = `You are Atlas AI, a travel expert with encyclopedic knowledge of hotels worldwide.
Given a hotel name, destination, and check-in/check-out dates, return accurate structured information about that hotel.
Return ONLY valid JSON — no markdown, no code fences, no extra text.`;

export const enrichHotelInfo = async (
  env: Env,
  name: string,
  destination: string,
  checkinDate?: string,
  checkoutDate?: string,
): Promise<HotelEnrichOutput> => {
  const userPrompt =
    `Hotel: ${name}\nDestination: ${destination}` +
    (checkinDate ? `\nCheck-in: ${checkinDate}` : "") +
    (checkoutDate ? `\nCheck-out: ${checkoutDate}` : "") +
    `\n\nReturn structured information about this hotel.`;

  return generate({
    env,
    endpoint: "hotel-enrich",
    schema: hotelEnrichOutputSchema,
    system: HOTEL_ENRICH_SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 1024,
    temperature: 0.2,
  });
};

// ─── Plan modification ────────────────────────────────────────────────────────

const PLAN_MODIFY_SYSTEM_PROMPT = `You are Atlas AI, an expert travel planner.
Apply ONLY the explicitly requested change to the existing trip plan.

CRITICAL PRESERVATION RULES:
- Copy every field of every unchanged day EXACTLY as-is from the input JSON — attractions arrays, meals, transportation, notes, addresses, prices, everything.
- Do NOT regenerate, rewrite, paraphrase, or summarise any existing content.
- If the request only affects the "lodging" field: update ONLY that field for the specified days. Leave all other fields (attractions, meals, transportation, city, title, etc.) completely untouched.
- If new days must be added (e.g. trip extended): generate content only for the new days.
- If days must be removed (e.g. trip shortened): remove only the excess days, keep the rest verbatim.
- Return the COMPLETE updated plan (all days) as valid JSON using the same schema as the input.
- JSON only — no markdown, no code fences, no extra prose.`;

export const applyPlanModification = async (
  env: Env,
  itinerary: Record<string, unknown>,
  request: string,
): Promise<TripPlanOutput> => {
  return generate({
    env,
    endpoint: "modify",
    schema: tripPlanOutputSchema,
    system: PLAN_MODIFY_SYSTEM_PROMPT,
    prompt: `Current trip plan:\n${JSON.stringify(itinerary, null, 2)}\n\nRequested change:\n${request}`,
    maxOutputTokens: 32768,
    temperature: 0.3,
  });
};
