import { parse } from "cookie";
import type { Response } from "express";

import type { Env } from "@/env";
import { SESSION_TTL_SECONDS } from "@/shared/constants";

export function getSessionCookieName(env: Env): string {
  return env.SESSION_COOKIE_NAME;
}

export function parseSessionIdFromCookie(
  cookieHeader: string | undefined,
  env: Env,
): string | null {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  const name = getSessionCookieName(env);
  const v = cookies[name];
  return v && v.length > 0 ? v : null;
}

export function setSessionCookie(
  res: Response,
  env: Env,
  sessionId: string,
): void {
  const maxAgeMs = SESSION_TTL_SECONDS * 1000;
  const isProd = env.NODE_ENV === "production";
  res.cookie(getSessionCookieName(env), sessionId, {
    httpOnly: true,
    secure: isProd,
    // SameSite=None is required when shell and BFF are on different eTLD+1
    // (e.g. nexploring.com → nexploring-bff.vercel.app).
    // SameSite=None requires Secure=true, which is always set in production.
    // In dev we keep Lax because localhost is same-site and Secure is false.
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: maxAgeMs,
  });
}

export function clearSessionCookie(res: Response, env: Env): void {
  const isProd = env.NODE_ENV === "production";
  res.cookie(getSessionCookieName(env), "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
}
