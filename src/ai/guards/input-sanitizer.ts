export interface SanitizeUserRequestOptions {
  maxLength?: number;
}

export class UserRequestValidationError extends Error {
  readonly code: "EMPTY_REQUEST" | "REQUEST_TOO_LONG" | "NON_TRAVEL_REQUEST";

  constructor(
    code: "EMPTY_REQUEST" | "REQUEST_TOO_LONG" | "NON_TRAVEL_REQUEST",
    message: string,
  ) {
    super(message);
    this.name = "UserRequestValidationError";
    this.code = code;
  }
}

const DEFAULT_MAX_LENGTH = 10_000;

const INJECTION_PATTERNS = [
  /\bignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?\b/gi,
  /\bdisregard\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?\b/gi,
  /\bforget\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?\b/gi,
  /\boverride\s+(the\s+)?(system|developer)\s+(prompt|message|instructions?)\b/gi,
  /\b(system|developer)\s+(prompt|message|instructions?)\s*:/gi,
  /\breveal\s+(the\s+)?(system|developer)\s+(prompt|message|instructions?)\b/gi,
  /\bprint\s+(the\s+)?(system|developer)\s+(prompt|message|instructions?)\b/gi,
  /\bjailbreak\b/gi,
  /\bDAN\b/g,
];

const XML_TAG_BREAK_PATTERN = /<\/?\s*(user_request|system|developer|assistant)\s*>/gi;

const TRAVEL_INTENT_PATTERN =
  /\b(trip|travel|traveller|traveler|itinerary|plan|route|day|destination|city|country|region|neighbou?rhood|hotel|hostel|lodging|stay|flight|airport|train|transport|transfer|restaurant|meal|breakfast|lunch|dinner|snack|attraction|museum|tour|activity|experience|weather|budget|price|cost|pace|walking|visit|arrive|depart|check-?in|check-?out)\b/i;

export function sanitizeUserRequest(
  request: string,
  opts: SanitizeUserRequestOptions = {},
): string {
  const maxLength = opts.maxLength ?? DEFAULT_MAX_LENGTH;
  let sanitized = request.trim();

  if (!sanitized) {
    throw new UserRequestValidationError(
      "EMPTY_REQUEST",
      "Request must not be empty",
    );
  }

  if (sanitized.length > maxLength) {
    throw new UserRequestValidationError(
      "REQUEST_TOO_LONG",
      `Request must be ${maxLength} characters or fewer`,
    );
  }

  sanitized = sanitized.replace(XML_TAG_BREAK_PATTERN, " ");
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, " ");
  }
  sanitized = sanitized
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[\s.,;:!?-]+/, "")
    .trim();

  if (!sanitized) {
    throw new UserRequestValidationError(
      "EMPTY_REQUEST",
      "Request must include travel planning instructions",
    );
  }

  if (!TRAVEL_INTENT_PATTERN.test(sanitized)) {
    throw new UserRequestValidationError(
      "NON_TRAVEL_REQUEST",
      "Request must be related to trip planning or itinerary editing",
    );
  }

  return sanitized;
}
