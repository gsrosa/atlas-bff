import type { Response } from "express";
import { parse } from "cookie";

import type { Env } from "@/env/env";

export function getSessionCookieName(env: Env): string {
  return env.SESSION_COOKIE_NAME;
}

export function parseSessionIdFromCookie(cookieHeader: string | undefined, env: Env): string | null {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  const name = getSessionCookieName(env);
  const v = cookies[name];
  return v && v.length > 0 ? v : null;
}

export function setSessionCookie(res: Response, env: Env, sessionId: string): void {
  const maxAgeMs = 60 * 60 * 24 * 7 * 1000;
  res.cookie(getSessionCookieName(env), sessionId, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
  });
}

export function clearSessionCookie(res: Response, env: Env): void {
  res.cookie(getSessionCookieName(env), "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
