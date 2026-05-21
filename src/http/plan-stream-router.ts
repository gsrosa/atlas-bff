import { type Router as ExpressRouter, Router } from "express";
import { z } from "zod";

import {
  sanitizeUserRequest,
  UserRequestValidationError,
} from "@/ai/guards/input-sanitizer";
import { assertTripPlanQuality } from "@/ai/guards/quality-assertions";
import type { Env } from "@/env";
import {
  creditCostForDays,
  deriveDayCountFromAnswers,
  deriveDayCountFromHotels,
  modifyCostForDays,
  PLAN_MAX_DAYS,
} from "@/lib/credit-utils";
import { requireBearerAuth } from "@/middleware/require-bearer-auth";
import {
  applyPlanModification,
  editTripPlan,
  enrichHotelInfo,
  generateChecklistFromAnswers,
  streamTripPlanFromAnswers,
} from "@/services/ai-generate.service";
import * as creditsService from "@/services/credits.service";
import { streamGeminiText } from "@/services/gemini-stream.service";
import {
  editTripPlanInputSchema,
  streamAiInputSchema,
} from "@/shared/validation-schema/ai-stream";
import {
  checklistInputSchema,
  tripPlanInputSchema,
} from "@/shared/validation-schema/planner-input";

export const createPlanStreamRouter = (env: Env): ExpressRouter => {
  const r = Router();

  /** Generate AI follow-up questions from the traveller's base answers. */
  r.post("/checklist", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }
    const parsed = checklistInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      return;
    }

    // Validate day count cap
    const { answers, tripDetails } = parsed.data;
    const hotelDays = tripDetails?.hotels
      ? deriveDayCountFromHotels(tripDetails.hotels)
      : null;
    const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);
    if (effectiveDays !== null && effectiveDays > PLAN_MAX_DAYS) {
      res
        .status(400)
        .json({
          error: "TRIP_TOO_LONG",
          maxDays: PLAN_MAX_DAYS,
          requestedDays: effectiveDays,
        });
      return;
    }

    try {
      const result = await generateChecklistFromAnswers(
        env,
        answers,
        {
          accessToken: req.atlasAccessToken,
          userId: req.atlasUser?.id,
        },
        tripDetails,
      );
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({
          error: err instanceof Error ? err.message : "Generation failed",
        });
    }
  });

  /** Generate a full day-by-day trip plan from answers. */
  r.post("/trip", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }
    const parsed = tripPlanInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      return;
    }

    const { answers, aiQuestions, aiAnswers, tripDetails } = parsed.data;
    const userId = req.atlasUser?.id;
    const accessToken = req.atlasAccessToken;

    // Day count → credit tier
    const hotelDays = tripDetails?.hotels
      ? deriveDayCountFromHotels(tripDetails.hotels)
      : null;
    const effectiveDays = hotelDays ?? deriveDayCountFromAnswers(answers);
    if (effectiveDays !== null && effectiveDays > PLAN_MAX_DAYS) {
      res
        .status(400)
        .json({
          error: "TRIP_TOO_LONG",
          maxDays: PLAN_MAX_DAYS,
          requestedDays: effectiveDays,
        });
      return;
    }
    const PLAN_COST = creditCostForDays(effectiveDays ?? 7) ?? 5;

    if (userId && accessToken) {
      const { balance } = await creditsService.getBalance(
        env,
        accessToken,
        userId,
      );
      if (balance < PLAN_COST) {
        res
          .status(402)
          .json({
            error: "INSUFFICIENT_CREDITS",
            required: PLAN_COST,
            available: balance,
          });
        return;
      }
    }

    try {
      const { result, expectedDays } = await streamTripPlanFromAnswers(
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
        await creditsService.applyCredit(env, {
          userId,
          delta: -PLAN_COST,
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
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
        res.end();
      }
    }
  });

  /** Apply a natural-language edit to an existing trip plan. */
  r.post("/edit", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }
    const parsed = editTripPlanInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      return;
    }
    let userPrompt: string;
    try {
      userPrompt = sanitizeUserRequest(parsed.data.userPrompt, {
        maxLength: 100_000,
      });
    } catch (err) {
      if (err instanceof UserRequestValidationError) {
        res.status(400).json({ error: err.code, message: err.message });
        return;
      }
      throw err;
    }

    try {
      const result = await editTripPlan(env, {
        userPrompt,
        maxTokens: parsed.data.maxOutputTokens,
        temperature: parsed.data.temperature,
      });
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({
          error: err instanceof Error ? err.message : "Generation failed",
        });
    }
  });

  /** Stream raw text from Gemini (SSE). */
  r.post("/stream", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }
    const parsed = streamAiInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      return;
    }
    try {
      const result = await streamGeminiText(env, parsed.data);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      let chunkIndex = 0;
      for await (const chunk of result.textStream) {
        console.log(`[stream] chunk #${chunkIndex++}:`, JSON.stringify(chunk));
        res.write(
          `data: ${JSON.stringify({ type: "text", delta: chunk })}\n\n`,
        );
      }
      console.log(`[stream] done — ${chunkIndex} chunks`);
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stream failed";
      console.error("[stream] error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: message });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
        res.end();
      }
    }
  });

  /** Enrich hotel info using AI. */
  r.post("/hotel-enrich", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }
    const parsed = z
      .object({
        name: z.string().min(1).max(500),
        destination: z.string().max(500).default(""),
        checkinDate: z.string().optional(),
        checkoutDate: z.string().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      return;
    }
    try {
      const result = await enrichHotelInfo(
        env,
        parsed.data.name,
        parsed.data.destination,
        parsed.data.checkinDate,
        parsed.data.checkoutDate,
      );
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({
          error: err instanceof Error ? err.message : "Enrichment failed",
        });
    }
  });

  /** Apply a natural-language modification to an existing trip plan. */
  r.post("/modify", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }
    const parsed = z
      .object({
        itinerary: z.record(z.unknown()),
        request: z.string().min(1).max(10_000),
      })
      .safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      return;
    }

    let sanitizedRequest: string;
    try {
      sanitizedRequest = sanitizeUserRequest(parsed.data.request);
    } catch (err) {
      if (err instanceof UserRequestValidationError) {
        res.status(400).json({ error: err.code, message: err.message });
        return;
      }
      throw err;
    }

    const itineraryDays = Array.isArray(parsed.data.itinerary.days)
      ? (parsed.data.itinerary.days as unknown[]).length
      : 7;
    const MODIFY_COST = modifyCostForDays(itineraryDays);
    const userId = req.atlasUser?.id;
    const accessToken = req.atlasAccessToken;

    if (userId && accessToken) {
      const { balance } = await creditsService.getBalance(
        env,
        accessToken,
        userId,
      );
      if (balance < MODIFY_COST) {
        res
          .status(402)
          .json({
            error: "INSUFFICIENT_CREDITS",
            required: MODIFY_COST,
            available: balance,
          });
        return;
      }
    }

    try {
      const result = await applyPlanModification(
        env,
        parsed.data.itinerary,
        sanitizedRequest,
      );
      if (userId && accessToken) {
        await creditsService.applyCredit(env, {
          userId,
          delta: -MODIFY_COST,
          reason: "plan_modify",
          referenceType: "trip_plan",
        });
      }
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({
          error: err instanceof Error ? err.message : "Modification failed",
        });
    }
  });

  return r;
};
