import { describe, expect, it } from "vitest";

import { signInInputSchema, signUpInputSchema } from "@/shared/validation-schema/auth";

describe("auth Zod schemas", () => {
  it("signInInputSchema accepts email + password", () => {
    expect(signInInputSchema.parse({ email: "a@b.co", password: "x" })).toEqual({
      email: "a@b.co",
      password: "x",
    });
  });

  it("signUpInputSchema enforces password rules", () => {
    expect(() =>
      signUpInputSchema.parse({
        email: "a@b.co",
        password: "short",
        firstName: "A",
        lastName: "B",
        gender: "other",
        country: "US",
      }),
    ).toThrow();
  });
});
