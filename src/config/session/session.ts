import type { Session, User } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

import type { Env } from "@/env";
import { getRedis } from "@/lib/redis";
import { createServiceClient, getUserFromAccessToken } from "@/lib/supabase";
import { SESSION_PREFIX, SESSION_TTL_SECONDS } from "@/shared/constants";

export type StoredSessionPayload = {
  access_token: string;
  refresh_token: string;
  user_id: string;
};

export async function createSessionFromSupabase(
  env: Env,
  session: Session,
): Promise<string> {
  const id = randomBytes(32).toString("hex");
  const payload: StoredSessionPayload = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user_id: session.user.id,
  };
  await getRedis(env).setex(
    `${SESSION_PREFIX}${id}`,
    SESSION_TTL_SECONDS,
    JSON.stringify(payload),
  );
  return id;
}

export async function deleteSession(
  env: Env,
  sessionId: string,
): Promise<void> {
  await getRedis(env).del(`${SESSION_PREFIX}${sessionId}`);
}

export async function resolveSession(
  env: Env,
  sessionId: string,
): Promise<{ accessToken: string; user: User } | null> {
  const raw = await getRedis(env).get(`${SESSION_PREFIX}${sessionId}`);
  if (!raw) return null;

  let payload: StoredSessionPayload;
  try {
    payload = JSON.parse(raw) as StoredSessionPayload;
  } catch {
    await deleteSession(env, sessionId);
    return null;
  }

  const service = createServiceClient(env);

  const tryRefresh = async (): Promise<{
    accessToken: string;
    user: User;
  } | null> => {
    const { data, error } = await service.auth.refreshSession({
      refresh_token: payload.refresh_token,
    });
    if (error || !data.session || !data.user) {
      await deleteSession(env, sessionId);
      return null;
    }
    const next: StoredSessionPayload = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user.id,
    };
    await getRedis(env).setex(
      `${SESSION_PREFIX}${sessionId}`,
      SESSION_TTL_SECONDS,
      JSON.stringify(next),
    );
    return { accessToken: data.session.access_token, user: data.user };
  };

  const r = await getUserFromAccessToken(service, payload.access_token);
  if (r.user && !r.error) {
    await getRedis(env).expire(
      `${SESSION_PREFIX}${sessionId}`,
      SESSION_TTL_SECONDS,
    );
    return { accessToken: payload.access_token, user: r.user };
  }

  return tryRefresh();
}
