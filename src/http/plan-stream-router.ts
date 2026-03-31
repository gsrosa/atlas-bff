import { Router, type Router as ExpressRouter } from "express";
import type { Env } from "@/env/env";
import { requireBearerAuth } from "@/middleware/require-bearer-auth";
import { streamGeminiText } from "@/services/gemini-stream.service";
import { streamAiInputSchema } from "@/shared/validation-schema/ai-stream";

const sseData = (payload: unknown) =>
  `data: ${JSON.stringify(payload)}\n\n`;

export const createPlanStreamRouter = (env: Env): ExpressRouter => {
  const r = Router();

  /**
   * Server-Sent Events stream of AI tokens for plan generation.
   * Auth: httpOnly **session cookie** (same as tRPC) or `Authorization: Bearer <access token>`.
   * Events: `{ type: "text", delta: string }`, then `{ type: "done" }`, or `{ type: "error", message: string }`.
   */
  r.post("/stream", requireBearerAuth(env), async (req, res) => {
    if (!env.GEMINI_API_KEY) {
      res.status(503).json({ error: "AI provider is not configured on the server" });
      return;
    }

    const parsed = streamAiInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      for await (const delta of streamGeminiText(env, parsed.data)) {
        res.write(sseData({ type: "text", delta }));
      }
      res.write(sseData({ type: "done" }));
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stream failed";
      res.write(sseData({ type: "error", message }));
      res.end();
    }
  });

  return r;
};
