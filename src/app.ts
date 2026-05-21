import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import type { Env } from "@/env";
import { createMeRouter } from "@/http/me-router";
import { createPlanStreamRouter } from "@/http/plan-stream-router";
import { createContextFactory } from "@/trpc/context";
import { trpcOnError } from "@/trpc/error-handler";
import { appRouter } from "@/trpc/routes/_app";

const normalizeOrigin = (origin: string): string => {
  try {
    return new URL(origin).origin.toLowerCase();
  } catch {
    return origin.trim().replace(/\/+$/, "").toLowerCase();
  }
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[|\\{}()[\]^$+?.*]/g, "\\$&");
};

const isOriginAllowed = (allowedOrigins: string[], origin: string): boolean => {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === "*") {
      return true;
    }

    if (!allowedOrigin.includes("*")) {
      return allowedOrigin === origin;
    }

    const pattern = `^${escapeRegExp(allowedOrigin).replace(/\\\*/g, ".*")}$`;
    return new RegExp(pattern).test(origin);
  });
};

const createCorsOriginValidator = (allowedOrigins: string[]) => {
  const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(
      null,
      isOriginAllowed(normalizedAllowedOrigins, normalizeOrigin(origin)),
    );
  };
};

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
      origin: createCorsOriginValidator(env.CORS_ORIGINS),
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

  app.use(createMeRouter(env));

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
