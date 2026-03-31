import { describe, expect, it } from "vitest";

import { parseBearer } from "@/utils/parse-bearer";

describe("parseBearer", () => {
  it("returns token for Bearer scheme", () => {
    expect(parseBearer("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(parseBearer("bearer token123")).toBe("token123");
  });

  it("returns null when missing or invalid", () => {
    expect(parseBearer(undefined)).toBeNull();
    expect(parseBearer("")).toBeNull();
    expect(parseBearer("Basic xxx")).toBeNull();
  });
});
