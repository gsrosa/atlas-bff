import { describe, expect, it } from "vitest";

import { buildKnowledgeEmbeddingText } from "@/services/rag.service";

describe("buildKnowledgeEmbeddingText", () => {
  it("builds stable embedding input from knowledge fields", () => {
    expect(
      buildKnowledgeEmbeddingText({
        destination: "Tokyo",
        country: "Japan",
        title: "Routing",
        content: "Group nearby neighborhoods.",
      }),
    ).toBe(
      [
        "Destination: Tokyo",
        "Country: Japan",
        "Title: Routing",
        "Group nearby neighborhoods.",
      ].join("\n"),
    );
  });
});
