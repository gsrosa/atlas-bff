import type { RequestHandler } from "express";

import { hasAiProvider } from "@/ai/client";
import type { Env } from "@/env";
import { ChecklistService } from "@/services/ai-services/ai-generate.service";
import { checklistInputSchema } from "@/shared/validation-schema/planner-input";
import {
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
  PLAN_MAX_DAYS,
} from "@/utils/credit";

export const createChecklistHandler =
  (env: Env): RequestHandler =>
  async (req, res) => {
    if (!hasAiProvider(env)) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }

    const parsed = checklistInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { answers, tripDetails } = parsed.data;
    const hotelDays = tripDetails?.hotels
      ? deriveDayCountFromHotels(tripDetails.hotels)
      : null;
    const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);

    if (effectiveDays !== null && effectiveDays > PLAN_MAX_DAYS) {
      res.status(400).json({
        error: "TRIP_TOO_LONG",
        maxDays: PLAN_MAX_DAYS,
        requestedDays: effectiveDays,
      });
      return;
    }

    try {
      const result = await ChecklistService.generateChecklistFromAnswers(
        env,
        answers,
        {
          accessToken: req.nexploringAccessToken,
          userId: req.nexploringUser?.id,
        },
        tripDetails,
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Generation failed",
      });
    }
  };
