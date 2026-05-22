import type { Response } from "express";
import { type ZodSchema } from "zod";

import { hasAiProvider } from "@/ai/client";
import type { Env } from "@/env";
import { UserRequestValidationError } from "@/shared/errors";

import {
  sanitizeUserRequest,
  type SanitizeUserRequestOptions,
} from "./input-sanitizer";

export const ensureAiProvider = (env: Env): boolean => {
  if (hasAiProvider(env)) return true;

  throw new Error("503");
};

export const sanitizeAiUserRequestOrRespond = (
  res: Response,
  request: string,
  options?: SanitizeUserRequestOptions,
): string | null => {
  try {
    return sanitizeUserRequest(request, options);
  } catch (err) {
    if (err instanceof UserRequestValidationError) {
      throw new Error("400");
    }
    throw err;
  }
};

export const parseRequest = <T>(schema: ZodSchema, body: ReadableStream): T => {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new Error("400");
  }

  return parsed.data;
};

export const replyResponseAccordingError = (
  errorCode: string,
  res: Response,
) => {
  if (errorCode === "503")
    return res.status(503).json({ message: "No AI provider configured" });

  if (errorCode === "500")
    return res.status(500).json({ message: "Internal server error" });

  return res.status(400).json({ message: "Bad request" });
};
