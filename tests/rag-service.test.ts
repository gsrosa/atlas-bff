import { describe, expect, it } from "vitest";

import { RagService } from "@/services/ai-services/rag.service";

describe("buildKnowledgeEmbeddingText", () => {
  it("builds stable embedding input from knowledge fields", () => {
    expect(
      RagService.buildKnowledgeEmbeddingText({
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
