import type { RequestHandler } from "express";

import { hasAiProvider } from "@/ai/client";
import type { Env } from "@/env";
import { GeminiStreamService } from "@/services/ai-services/gemini-stream.service";
import { streamAiInputSchema } from "@/shared/validation-schema/ai-stream";

export const createStreamHandler =
  (env: Env): RequestHandler =>
  async (req, res) => {
    if (!hasAiProvider(env)) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
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

    try {
      const result = await GeminiStreamService.streamGeminiText(env, parsed.data);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      for await (const chunk of result.textStream) {
        res.write(
          `data: ${JSON.stringify({ type: "text", delta: chunk })}\n\n`,
        );
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stream failed";
      if (!res.headersSent) {
        res.status(500).json({ error: message });
        return;
      }
      res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
      res.end();
    }
  };
