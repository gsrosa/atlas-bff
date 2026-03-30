import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import type { Env } from "@/env/env";
import { createPlanStreamRouter } from "@/http/plan-stream-router";
import { createContextFactory } from "@/trpc/context";
import { trpcOnError } from "@/trpc/error-handler";
import { appRouter } from "@/trpc/routes/_app";

export const createApp = (env: Env): Express => {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production",
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  const trpcLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, slow down." },
  });

  const planStreamLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many plan stream requests, slow down." },
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/plans", planStreamLimiter, createPlanStreamRouter(env));

  app.use(
    "/trpc",
    trpcLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext: createContextFactory(env),
      onError: trpcOnError,
    }),
  );

  return app;
};
