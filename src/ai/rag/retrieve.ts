import type { Env } from "@/env";
import { RagModel } from "@/models/rag.model";

import { embedText } from "./embed";

export interface DestinationContextChunk {
  id: string;
  destination: string;
  country?: string | null;
  title: string;
  content: string;
  sourceUrl?: string | null;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface RetrieveDestinationContextOptions {
  destination?: string;
  country?: string;
  limit?: number;
  threshold?: number;
}

interface DestinationKnowledgeRow {
  id: string;
  destination: string;
  country: string | null;
  title: string;
  content: string;
  source_url: string | null;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

export async function retrieveDestinationContext(
  env: Env,
  query: string,
  opts: RetrieveDestinationContextOptions = {},
): Promise<DestinationContextChunk[]> {
  const embedding = await embedText(env, query);
  const data = await RagModel.matchDestinationKnowledge(env, {
    embedding,
    matchCount: opts.limit ?? 5,
    matchThreshold: opts.threshold ?? 0.75,
    destinationFilter: opts.destination ?? null,
    countryFilter: opts.country ?? null,
  });

  return (data as DestinationKnowledgeRow[]).map((row) => ({
    id: row.id,
    destination: row.destination,
    country: row.country,
    title: row.title,
    content: row.content,
    sourceUrl: row.source_url,
    metadata: row.metadata ?? {},
    similarity: row.similarity,
  }));
}

export function formatDestinationContextBlock(
  chunks: DestinationContextChunk[],
): string {
  if (chunks.length === 0) return "";

  return [
    "DESTINATION KNOWLEDGE:",
    ...chunks.map((chunk, index) => {
      const location = [chunk.destination, chunk.country]
        .filter(Boolean)
        .join(", ");
      const source = chunk.sourceUrl ? `\nSource: ${chunk.sourceUrl}` : "";
      return `${index + 1}. ${chunk.title} (${location})\n${chunk.content}${source}`;
    }),
  ].join("\n\n");
}
