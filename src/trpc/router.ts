import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { authMiddleware } from "./middlewares/auth.middleware.js";
import type { Context } from "./context.js";
import { errorFormatter } from "./error-handler.js";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter,
});

export const router = t.router;
export const middleware = t.middleware;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
