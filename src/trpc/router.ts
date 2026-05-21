import { initTRPC,TRPCError } from "@trpc/server";
import superjson from "superjson";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  UserRequestValidationError,
} from "@/shared/errors";

import { authMiddleware } from "./middlewares/auth.middleware.js";
import type { Context } from "./context.js";
import { errorFormatter } from "./error-handler.js";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter,
});

/**
 * Catches domain errors thrown from services and maps them to the correct
 * TRPCError code so the HTTP layer returns the right status.
 */
const domainErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    if (err instanceof TRPCError) throw err;
    if (err instanceof UnauthorizedError)
      throw new TRPCError({ code: "UNAUTHORIZED", message: err.message, cause: err });
    if (err instanceof ForbiddenError)
      throw new TRPCError({ code: "FORBIDDEN", message: err.message, cause: err });
    if (err instanceof NotFoundError)
      throw new TRPCError({ code: "NOT_FOUND", message: err.message, cause: err });
    if (err instanceof ConflictError)
      throw new TRPCError({ code: "CONFLICT", message: err.message, cause: err });
    if (err instanceof UserRequestValidationError)
      throw new TRPCError({ code: "BAD_REQUEST", message: err.message, cause: err });
    if (err instanceof BadRequestError)
      throw new TRPCError({ code: "BAD_REQUEST", message: err.message, cause: err });
    if (err instanceof InternalServerError)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message, cause: err });
    throw err;
  }
});

export const router = t.router;
export const middleware = t.middleware;

export const publicProcedure = t.procedure.use(domainErrorMiddleware);
export const protectedProcedure = t.procedure.use(domainErrorMiddleware).use(authMiddleware);
