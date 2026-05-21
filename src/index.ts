import { createApp } from "@/app";
import { loadEnv } from "@/env/index.js";

import "./load-env.js";

export type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from "@/trpc/routes/_app";

const env = loadEnv();
const app = createApp(env);

const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  app.listen(env.PORT, () => {
    console.log(`atlas-bff listening on http://127.0.0.1:${env.PORT}`);
  });
}

export default app;
