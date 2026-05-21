const RETRYABLE_MESSAGES = ["429", "503", "overloaded", "rate limit"];

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return RETRYABLE_MESSAGES.some((m) => err.message.includes(m));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err)) throw err;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}
