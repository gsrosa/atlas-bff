import type { Env } from "@/env/env";
import type { StreamAiInput } from "@/shared/validation-schema/ai-stream";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Streams incremental text from Gemini `streamGenerateContent` (SSE, `alt=sse`).
 * API key stays on the server; callers never see it.
 */
export async function* streamGeminiText(
  env: Env,
  input: StreamAiInput,
): AsyncGenerator<string, void, undefined> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the BFF");
  }

  const model = input.model ?? env.GEMINI_MODEL;
  const url = `${GEMINI_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?key=${encodeURIComponent(apiKey)}&alt=sse`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: input.userPrompt }] }],
    generationConfig: {
      temperature: input.temperature ?? 0.7,
      maxOutputTokens: input.maxOutputTokens ?? 8192,
    },
  };

  if (input.systemPrompt) {
    body.systemInstruction = { parts: [{ text: input.systemPrompt }] };
  }
  if (input.responseMimeType) {
    (body.generationConfig as Record<string, unknown>).responseMimeType = input.responseMimeType;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  if (!res.body) {
    throw new Error("Gemini returned an empty body");
  }

  yield* parseGeminiSseStream(res.body);
}

type GeminiChunk = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

async function* parseGeminiSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, undefined> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let carry = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    carry += decoder.decode(value, { stream: true });

    const events = carry.split("\n\n");
    carry = events.pop() ?? "";

    for (const rawEvent of events) {
      const line = rawEvent
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("data:"));
      if (!line) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      let json: GeminiChunk;
      try {
        json = JSON.parse(jsonStr) as GeminiChunk;
      } catch {
        continue;
      }

      const text = json.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .filter(Boolean)
        .join("");
      if (text) {
        yield text;
      }
    }
  }

  if (carry.trim()) {
    const line = carry
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("data:"));
    if (line) {
      const jsonStr = line.slice(5).trim();
      if (jsonStr && jsonStr !== "[DONE]") {
        try {
          const json = JSON.parse(jsonStr) as GeminiChunk;
          const text = json.candidates?.[0]?.content?.parts
            ?.map((p) => p.text)
            .filter(Boolean)
            .join("");
          if (text) yield text;
        } catch {
          /* ignore trailing garbage */
        }
      }
    }
  }
}
