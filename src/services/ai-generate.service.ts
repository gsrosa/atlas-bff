import { generateObject } from "ai";
import type { ZodSchema } from "zod";

import { buildAiModel, NO_THINKING } from "@/ai/client";
import { logAiCall } from "@/ai/logger";
import {
  CHECKLIST_PROMPT_VERSION,
  CHECKLIST_SYSTEM_PROMPT,
  HOTEL_ENRICH_PROMPT_VERSION,
  HOTEL_ENRICH_SYSTEM_PROMPT,
  PLAN_MODIFY_PROMPT_VERSION,
  PLAN_MODIFY_SYSTEM_PROMPT,
  TRIP_PLAN_PROMPT_VERSION,
  TRIP_PLAN_SYSTEM_PROMPT,
} from "@/ai/prompts";
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
  promptVersion?: string;
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
      promptVersion: opts.promptVersion,
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
      promptVersion: opts.promptVersion,
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

// Prompts imported from @/ai/prompts — edit prompt files, not here.

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
    promptVersion: CHECKLIST_PROMPT_VERSION,
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
    promptVersion: TRIP_PLAN_PROMPT_VERSION,
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
    promptVersion: HOTEL_ENRICH_PROMPT_VERSION,
    schema: hotelEnrichOutputSchema,
    system: HOTEL_ENRICH_SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 1024,
    temperature: 0.2,
  });
};

// ─── Plan modification ────────────────────────────────────────────────────────

export const applyPlanModification = async (
  env: Env,
  itinerary: Record<string, unknown>,
  request: string,
): Promise<TripPlanOutput> => {
  return generate({
    env,
    endpoint: "modify",
    promptVersion: PLAN_MODIFY_PROMPT_VERSION,
    schema: tripPlanOutputSchema,
    system: PLAN_MODIFY_SYSTEM_PROMPT,
    prompt: `Current trip plan:\n${JSON.stringify(itinerary, null, 2)}\n\nRequested change:\n${request}`,
    maxOutputTokens: 32768,
    temperature: 0.3,
  });
};
