import type { RequestHandler } from "express";
import { z } from "zod";

import { hasAiProvider } from "@/ai/client";
import { sanitizeUserRequest } from "@/ai/guards/input-sanitizer";
import type { Env } from "@/env";
import { PlanModificationService } from "@/services/ai-services/ai-generate.service";
import { CreditsService } from "@/services/credits.service";
import { UserRequestValidationError } from "@/shared/errors";
import { modifyCostForDays } from "@/utils/credit";

const modifyInputSchema = z.object({
  itinerary: z.record(z.unknown()),
  request: z.string().min(1).max(10_000),
});

export const createModifyHandler =
  (env: Env): RequestHandler =>
  async (req, res) => {
    if (!hasAiProvider(env)) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }

    const parsed = modifyInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
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
        res.status(400).json({
          error: err.validationCode,
          message: err.message,
        });
        return;
      }
      throw err;
    }

    const itineraryDays = Array.isArray(parsed.data.itinerary.days)
      ? (parsed.data.itinerary.days as unknown[]).length
      : 7;
    const modifyCost = modifyCostForDays(itineraryDays);
    const userId = req.nexploringUser?.id;
    const accessToken = req.nexploringAccessToken;

    if (userId && accessToken) {
      const { balance } = await CreditsService.getBalance(
        env,
        accessToken,
        userId,
      );
      if (balance < modifyCost) {
        res.status(402).json({
          error: "INSUFFICIENT_CREDITS",
          required: modifyCost,
          available: balance,
        });
        return;
      }
    }

    try {
      const result = await PlanModificationService.applyPlanModification(
        env,
        parsed.data.itinerary,
        sanitizedRequest,
      );
      if (userId && accessToken) {
        await CreditsService.applyCredit(env, {
          userId,
          delta: -modifyCost,
          reason: "plan_modify",
          referenceType: "trip_plan",
        });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Modification failed",
      });
    }
  };
