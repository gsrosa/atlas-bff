import type { RequestHandler } from "express";
import { z } from "zod";

import { hasAiProvider } from "@/ai/client";
import type { Env } from "@/env";
import { HotelEnrichService } from "@/services/ai-services/ai-generate.service";

const hotelEnrichInputSchema = z.object({
  name: z.string().min(1).max(500),
  destination: z.string().max(500).default(""),
  checkinDate: z.string().optional(),
  checkoutDate: z.string().optional(),
});

export const createHotelEnrichHandler =
  (env: Env): RequestHandler =>
  async (req, res) => {
    if (!hasAiProvider(env)) {
      res
        .status(503)
        .json({ error: "AI provider is not configured on the server" });
      return;
    }

    const parsed = hotelEnrichInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
      return;
    }

    try {
      const result = await HotelEnrichService.enrichHotelInfo(
        env,
        parsed.data.name,
        parsed.data.destination,
        parsed.data.checkinDate,
        parsed.data.checkoutDate,
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Enrichment failed",
      });
    }
  };
