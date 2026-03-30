import type { AnyRouter, TRPCError } from "@trpc/server";
import type { HTTPErrorHandler } from "@trpc/server/http";
import type { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import type { Request } from "express";
import { ZodError } from "zod";

export const errorFormatter = ({
  shape,
  error,
}: {
  shape: DefaultErrorShape;
  error: TRPCError;
}) => {
  const cause = error.cause;
  const zodError =
    cause instanceof ZodError
      ? cause.flatten()
      : cause instanceof Error && cause.cause instanceof ZodError
        ? cause.cause.flatten()
        : null;

  return {
    ...shape,
    data: {
      ...shape.data,
      zodError,
    },
  };
};

export const trpcOnError: HTTPErrorHandler<AnyRouter, Request> = (opts) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`tRPC error on '${opts.path}':`, opts.error);
  }
};
