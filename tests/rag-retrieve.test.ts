import { describe, expect, it } from "vitest";

import {
  type DestinationContextChunk,
  formatDestinationContextBlock,
} from "@/ai/rag";

describe("formatDestinationContextBlock", () => {
  it("formats retrieved chunks for prompt injection", () => {
    const chunks: DestinationContextChunk[] = [
      {
        id: "chunk-1",
        destination: "Tokyo",
        country: "Japan",
        title: "Transit etiquette",
        content: "Avoid rush hour transfers with luggage.",
        sourceUrl: "https://example.com/tokyo",
        metadata: {},
        similarity: 0.91,
      },
    ];

    expect(formatDestinationContextBlock(chunks)).toBe(
      [
        "DESTINATION KNOWLEDGE:",
        "1. Transit etiquette (Tokyo, Japan)\nAvoid rush hour transfers with luggage.\nSource: https://example.com/tokyo",
      ].join("\n\n"),
    );
  });

  it("returns empty string for no chunks", () => {
    expect(formatDestinationContextBlock([])).toBe("");
  });
});
