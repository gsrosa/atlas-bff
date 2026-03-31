import "./load-env.js";

import { createApp } from "@/app";
import { loadEnv } from "@/env/env";

export type { AppRouter, RouterInputs, RouterOutputs } from "@/trpc/routes/_app";

const env = loadEnv();
const app = createApp(env);

app.listen(env.PORT, () => {
  console.log(`atlas-bff listening on http://127.0.0.1:${env.PORT}`);
});
