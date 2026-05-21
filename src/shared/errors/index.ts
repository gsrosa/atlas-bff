export class BadRequestError extends Error {
  readonly code = "BAD_REQUEST" as const;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED" as const;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends Error {
  readonly code = "INTERNAL_SERVER_ERROR" as const;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "InternalServerError";
  }
}

export class UserRequestValidationError extends Error {
  readonly validationCode:
    | "EMPTY_REQUEST"
    | "REQUEST_TOO_LONG"
    | "NON_TRAVEL_REQUEST";

  constructor(
    validationCode: "EMPTY_REQUEST" | "REQUEST_TOO_LONG" | "NON_TRAVEL_REQUEST",
    message: string,
  ) {
    super(message);
    this.name = "UserRequestValidationError";
    this.validationCode = validationCode;
  }
}

export class AiQualityError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Trip plan failed quality checks: ${issues.join("; ")}`);
    this.name = "AiQualityError";
    this.issues = issues;
  }
}
