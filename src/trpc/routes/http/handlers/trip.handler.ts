import type { RequestHandler } from "express";

import { hasAiProvider } from "@/ai/client";
import { assertTripPlanQuality } from "@/ai/guards/quality-assertions";
import type { Env } from "@/env";
import { TripGenerationService } from "@/services/ai-services/ai-generate.service";
import { CreditsService } from "@/services/credits.service";
import { tripPlanInputSchema } from "@/shared/validation-schema/planner-input";
import {
  creditCostForDays,
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
  PLAN_MAX_DAYS,
} from "@/utils/credit";

export const createTripHandler =
  (env: Env): RequestHandler =>
  async (req, res) => {
    if (!hasAiProvider(env)) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }

    const parsed = tripPlanInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { answers, aiQuestions, aiAnswers, tripDetails } = parsed.data;
    const userId = req.nexploringUser?.id;
    const accessToken = req.nexploringAccessToken;
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

    const planCost = creditCostForDays(effectiveDays ?? 7) ?? 5;
    if (userId && accessToken) {
      const { balance } = await CreditsService.getBalance(
        env,
        accessToken,
        userId,
      );
      if (balance < planCost) {
        res.status(402).json({
          error: "INSUFFICIENT_CREDITS",
          required: planCost,
          available: balance,
        });
        return;
      }
    }

    try {
      const { result, expectedDays } =
        await TripGenerationService.streamTripPlanFromAnswers(
          env,
          answers,
          aiQuestions,
          aiAnswers,
          { accessToken, userId },
          tripDetails,
        );

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      for await (const partial of result.partialObjectStream) {
        res.write(
          `data: ${JSON.stringify({ type: "partial", object: partial })}\n\n`,
        );
      }

      const finalObject = await result.object;
      assertTripPlanQuality(finalObject, { expectedDays });

      if (finalObject.days.length > PLAN_MAX_DAYS) {
        finalObject.days = finalObject.days.slice(0, PLAN_MAX_DAYS);
      }

      if (userId && accessToken) {
        await CreditsService.applyCredit(env, {
          userId,
          delta: -planCost,
          reason: "plan_generate",
          referenceType: "trip_plan",
        });
      }

      res.write(
        `data: ${JSON.stringify({ type: "done", object: finalObject })}\n\n`,
      );
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      if (!res.headersSent) {
        res.status(500).json({ error: message });
        return;
      }
      res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
      res.end();
    }
  };
