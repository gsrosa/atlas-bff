export type RouteCacheKeyInput = {
  origin: string;
  destination: string;
  mode: string;
  timeBucket?: string;
};

export const buildRouteCacheKey = (input: RouteCacheKeyInput): string =>
  [
    "route",
    normalize(input.origin),
    normalize(input.destination),
    normalize(input.mode),
    normalize(input.timeBucket ?? "anytime"),
  ].join(":");

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9:_.-]/g, "");
