import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { router } from "../router.js";

import { authRouter } from "./auth.js";
import { plansRouter } from "./plans.js";
import { usersRouter } from "./users.js";

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  plans: plansRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
