import { describe, expect, it } from "vitest";

import { parseSessionIdFromCookie } from "@/sessions/session-cookie";

import { buildTestEnv } from "./helpers/test-env";

describe("parseSessionIdFromCookie", () => {
  const env = buildTestEnv({ SESSION_COOKIE_NAME: "atlas_session" });

  it("extracts session id from Cookie header", () => {
    expect(parseSessionIdFromCookie("atlas_session=abc123; Path=/", env)).toBe("abc123");
  });

  it("returns null when cookie missing", () => {
    expect(parseSessionIdFromCookie(undefined, env)).toBeNull();
    expect(parseSessionIdFromCookie("other=1", env)).toBeNull();
  });
});
