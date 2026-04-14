import { Router, type Router as ExpressRouter } from "express";
import { z } from "zod";

import type { Env } from "@/env/env";
import { requireBearerAuth } from "@/middleware/require-bearer-auth";
import {
  applyPlanModification,
  editTripPlan,
  enrichHotelInfo,
  generateChecklistFromAnswers,
  generateTripPlanFromAnswers,
} from "@/services/ai-generate.service";
import { streamGeminiText } from "@/services/gemini-stream.service";
import { streamAiInputSchema } from "@/shared/validation-schema/ai-stream";
import {
  checklistInputSchema,
  tripPlanInputSchema,
} from "@/shared/validation-schema/planner-input";

export const createPlanStreamRouter = (env: Env): ExpressRouter => {
  const r = Router();

  /** Generate AI follow-up questions from the traveller's base answers. */
  r.post("/checklist", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "AI provider is not configured on the server" }); return; }
    const parsed = checklistInputSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() }); return; }
    try {
      const result = await generateChecklistFromAnswers(env, parsed.data.answers);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Generation failed" });
    }
  });

  /** Generate a full day-by-day trip plan from answers. */
  r.post("/trip", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "AI provider is not configured on the server" }); return; }
    const parsed = tripPlanInputSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() }); return; }
    try {
      const result = await generateTripPlanFromAnswers(
        env,
        parsed.data.answers,
        parsed.data.aiQuestions,
        parsed.data.aiAnswers,
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Generation failed" });
    }
  });

  /** Apply a natural-language edit to an existing trip plan (raw prompts). */
  r.post("/edit", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "AI provider is not configured on the server" }); return; }
    const parsed = streamAiInputSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() }); return; }
    try {
      const result = await editTripPlan(env, {
        systemPrompt: parsed.data.systemPrompt ?? "",
        userPrompt: parsed.data.userPrompt,
        maxTokens: parsed.data.maxOutputTokens,
        temperature: parsed.data.temperature,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Generation failed" });
    }
  });

  /** Stream raw text from Gemini (SSE). */
  r.post("/stream", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "AI provider is not configured on the server" }); return; }
    const parsed = streamAiInputSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() }); return; }
    try {
      const result = await streamGeminiText(env, parsed.data);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      let chunkIndex = 0;
      for await (const chunk of result.textStream) {
        console.log(`[stream] chunk #${chunkIndex++}:`, JSON.stringify(chunk));
        res.write(`data: ${JSON.stringify({ type: "text", delta: chunk })}\n\n`);
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
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "AI provider is not configured on the server" }); return; }
    const parsed = z.object({
      name: z.string().min(1).max(500),
      destination: z.string().max(500).default(""),
      checkinDate: z.string().optional(),
      checkoutDate: z.string().optional(),
    }).safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() }); return; }
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
      res.status(500).json({ error: err instanceof Error ? err.message : "Enrichment failed" });
    }
  });

  /** Apply a natural-language modification to an existing trip plan. */
  r.post("/modify", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) { res.status(503).json({ error: "AI provider is not configured on the server" }); return; }
    const parsed = z.object({
      itinerary: z.record(z.unknown()),
      request: z.string().min(1).max(10_000),
    }).safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() }); return; }
    try {
      const result = await applyPlanModification(env, parsed.data.itinerary, parsed.data.request);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Modification failed" });
    }
  });

  return r;
};
