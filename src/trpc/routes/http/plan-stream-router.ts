import { type Router as ExpressRouter, Router } from "express";

import type { Env } from "@/env";
import { createChecklistHandler } from "@/trpc/routes/http/handlers/checklist.handler";
import { createEditHandler } from "@/trpc/routes/http/handlers/edit.handler";
import { createHotelEnrichHandler } from "@/trpc/routes/http/handlers/hotel-enrich.handler";
import { createModifyHandler } from "@/trpc/routes/http/handlers/modify.handler";
import { createStreamHandler } from "@/trpc/routes/http/handlers/stream.handler";
import { createTripHandler } from "@/trpc/routes/http/handlers/trip.handler";

export const createPlanStreamRouter = (env: Env): ExpressRouter => {
  const router = Router();

  router.post("/checklist", createChecklistHandler(env));
  router.post("/trip", createTripHandler(env));
  router.post("/edit", createEditHandler(env));
  router.post("/stream", createStreamHandler(env));
  router.post("/hotel-enrich", createHotelEnrichHandler(env));
  router.post("/modify", createModifyHandler(env));

  return router;
};
