import Redis from "ioredis";

import type { Env } from "@/env";

const redisClients = new Map<string, Redis>();

export function getRedis(env: Env): Redis {
  const existing = redisClients.get(env.REDIS_URL);
  if (existing) return existing;
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  redisClients.set(env.REDIS_URL, client);
  return client;
}
