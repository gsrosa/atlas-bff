const BEARER = /^Bearer\s+(.+)$/i;

export const parseBearer = (authorization: string | undefined): string | null => {
  const match = authorization?.match(BEARER);
  return match?.[1] ?? null;
};
