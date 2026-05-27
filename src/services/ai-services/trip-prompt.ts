import { TRIP_PLAN_SYSTEM_PROMPT } from "@/ai/prompts";
import {
  formatDestinationContextBlock,
  retrieveDestinationContext,
} from "@/ai/rag";
import type { Env } from "@/env";
import { TravelerProfileService } from "@/services/traveler-profile.service";
import type {
  AiQuestionInput,
  AnswerMap,
  TripDetails,
} from "@/shared/validation-schema/planner-input";
import {
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
} from "@/utils/credit";

import { buildAIContextBlock } from "./traveler-profile-ai-context";

type ParsedDateRange = { start: Date; days: number; startStr: string; endStr: string };

type TripPlanPrompt = { systemPrompt: string; userPrompt: string; effectiveDays: number | null };

const fmt = (value: string | string[] | undefined): string => {
  if (!value) return "Not specified";
  if (Array.isArray(value)) return value.join(", ") || "Not specified";
  return value;
};

const parseDateRange = (
  value: string | string[] | undefined,
): ParsedDateRange | null => {
  if (!value || typeof value !== "string") return null;
  const [startStr, endStr] = value.split("|");
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const days =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return { start, days, startStr, endStr };
};

const isNearFuture = (date: Date, withinDays = 45): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
};

export const buildAnswerSummary = (
  answers: AnswerMap,
  tripDetails?: TripDetails,
): string => {
  const dateRange = parseDateRange(answers["exact-date-range"]);
  let tripLength: string;
  let travelDates: string;
  let weatherNote = "";

  if (dateRange) {
    tripLength = `${dateRange.days} days (exact: ${dateRange.startStr} -> ${dateRange.endStr})`;
    travelDates = `Exact dates: ${dateRange.startStr} -> ${dateRange.endStr}`;
    if (isNearFuture(dateRange.start)) {
      weatherNote =
        `- WEATHER FORECAST: Trip starts within 45 days. ` +
        `Call getWeatherForecast for ${dateRange.startStr} to ${dateRange.endStr}.`;
    }
  } else {
    tripLength =
      answers["trip-length"] === "custom-days" &&
      typeof answers["exact-days"] === "string"
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
    `- Regions: ${fmt(answers["regions"])}`,
    `- Accommodation types: ${hasAccommodation ? accommodationTypes : "Not specified"}`,
    `- Travel pace: ${fmt(answers["travel-pace"])}`,
    `- Special requirements: ${fmt(answers["special-requirements"]) || "None"}`,
  ];

  if (answers["departureCity"]) {
    lines.push(`- Departure city: ${answers["departureCity"]}`);
  }
  if (answers["transportMode"]) {
    lines.push(`- Transport mode: ${answers["transportMode"]}`);
    if (answers["transportMode"] === "flight") {
      if (answers["flightNumber"]) lines.push(`  Flight: ${answers["flightNumber"]}`);
      if (answers["flightDepartureDate"]) lines.push(`  Departs: ${answers["flightDepartureDate"]}`);
      if (answers["flightReturnDate"]) lines.push(`  Returns: ${answers["flightReturnDate"]}`);
    }
  }

  const enabledMeals = Array.isArray(answers["mealTypes"]) ? answers["mealTypes"] : [];
  if (enabledMeals.length > 0) {
    let descs: Partial<Record<string, string>> = {};
    const descRaw = answers["mealDescriptions"];
    if (typeof descRaw === "string" && descRaw) {
      try { descs = JSON.parse(descRaw) as Partial<Record<string, string>>; } catch { /* ignore */ }
    }
    lines.push(`MEAL RECOMMENDATIONS REQUESTED: ${(enabledMeals as string[]).join(", ")}`);
    for (const type of enabledMeals as string[]) {
      const note = descs[type]?.trim();
      if (note) lines.push(`  ${type} preference: ${note}`);
    }
  }

  if (answers["country-name"]) {
    lines.push(`- Specific country: ${answers["country-name"]}`);
  }
  if (weatherNote) lines.push(weatherNote);
  appendTripDetails(lines, tripDetails);
  return lines.join("\n");
};

export const buildTripPlanPrompt = async (
  env: Env,
  answers: AnswerMap,
  aiQuestions: AiQuestionInput[],
  aiAnswers: AnswerMap,
  opts?: { accessToken?: string; userId?: string },
  tripDetails?: TripDetails,
): Promise<TripPlanPrompt> => {
  const aiSummary = buildAiAnswerSummary(aiQuestions, aiAnswers);
  const baseSummary = buildAnswerSummary(answers, tripDetails);
  const tripCore =
    `BASE PREFERENCES:\n${baseSummary}\n\n` +
    `PERSONALISED DETAILS (from follow-up):\n${aiSummary || "None provided"}`;
  let mergedContext = tripCore;

  if (opts?.accessToken && opts.userId) {
    try {
      const { preferences } = await TravelerProfileService.getTravelerPreferences(
        env,
        opts.accessToken,
        opts.userId,
      );
      mergedContext = buildAIContextBlock(preferences, tripCore);
    } catch {
      mergedContext = tripCore;
    }
  }

  const hotelDays = tripDetails?.hotels
    ? deriveDayCountFromHotels(tripDetails.hotels)
    : null;
  const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);
  const dayInstruction = effectiveDays
    ? `\nGenerate EXACTLY ${effectiveDays} days; the days array must have exactly ${effectiveDays} objects.`
    : "";
  const systemPrompt = await buildTripPlanSystemPrompt(
    env,
    answers,
    `${baseSummary}\n\n${aiSummary}`,
  );
  const userPrompt =
    `Create a complete trip plan for the following traveller:\n\n` +
    `${mergedContext}\n\n` +
    `Use all of the above to select the best destination and build the full day-by-day plan.${dayInstruction}`;

  return { systemPrompt, userPrompt, effectiveDays };
};

const appendTripDetails = (
  lines: string[],
  tripDetails: TripDetails | undefined,
): void => {
  if (!tripDetails) return;
  if (tripDetails.hotels?.length) {
    lines.push(
      `- Pre-booked hotels: ${tripDetails.hotels.map((h) => h.name).join("; ")}`,
    );
  }
  if (tripDetails.flights?.length) {
    lines.push(
      `- Pre-booked flights: ${tripDetails.flights.map((f) => f.flightNumber).join("; ")}`,
    );
  }
};

const buildAiAnswerSummary = (questions: AiQuestionInput[], answers: AnswerMap) =>
  questions.map((q) => `- ${q.question}: ${fmt(answers[q.id])}`).join("\n");

const buildTripPlanSystemPrompt = async (
  env: Env,
  answers: AnswerMap,
  retrievalQuery: string,
): Promise<string> => {
  try {
    const chunks = await retrieveDestinationContext(env, retrievalQuery, {
      destination: firstAnswer(answers["destination-in-mind"]),
      country: firstAnswer(answers["country-name"]),
      limit: 5,
      threshold: 0.72,
    });
    const contextBlock = formatDestinationContextBlock(chunks);
    if (!contextBlock) return TRIP_PLAN_SYSTEM_PROMPT;
    return `${TRIP_PLAN_SYSTEM_PROMPT}\n\n${contextBlock}`;
  } catch {
    return TRIP_PLAN_SYSTEM_PROMPT;
  }
};

const firstAnswer = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;
