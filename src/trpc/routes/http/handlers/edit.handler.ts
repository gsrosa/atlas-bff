import type { RequestHandler } from "express";

import { hasAiProvider } from "@/ai/client";
import { sanitizeUserRequest } from "@/ai/guards/input-sanitizer";
import type { Env } from "@/env";
import { EditTripPlanService } from "@/services/ai-services/ai-generate.service";
import { UserRequestValidationError } from "@/shared/errors";
import { editTripPlanInputSchema } from "@/shared/validation-schema/ai-stream";

export const createEditHandler =
  (env: Env): RequestHandler =>
  async (req, res) => {
    if (!hasAiProvider(env)) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }

    const parsed = editTripPlanInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
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
        res.status(400).json({
          error: err.validationCode,
          message: err.message,
        });
        return;
      }
      throw err;
    }

    try {
      const result = await EditTripPlanService.editTripPlan(env, {
        userPrompt,
        maxTokens: parsed.data.maxOutputTokens,
        temperature: parsed.data.temperature,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Generation failed",
      });
    }
  };
