import express from "express";

import { createApp } from "@/create-app";
import { loadEnv } from "@/env/index.js";

import "./load-env.js";

export type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from "@/trpc/routes/_app";

const env = loadEnv();
const app = createApp(express(), env);

const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  app.listen(env.PORT, () => {
    process.stdout.write(
      `nexploring-bff listening on http://127.0.0.1:${env.PORT}\n`,
    );
  });
}

export default app;
