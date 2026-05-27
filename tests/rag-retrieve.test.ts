import { describe, expect, it } from "vitest";

import {
  type DestinationContextChunk,
  formatDestinationContextBlock,
} from "@/ai/rag";

describe("formatDestinationContextBlock", () => {
  it("formats retrieved chunks as compact prompt bullets", () => {
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
        "Destination context:",
        "- Transit etiquette - Tokyo, Japan: Avoid rush hour transfers with luggage.",
      ].join("\n"),
    );
  });

  it("returns empty string for no chunks", () => {
    expect(formatDestinationContextBlock([])).toBe("");
  });
});
