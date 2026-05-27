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
    "Destination context:",
    ...chunks.slice(0, 5).map((chunk) => {
      const location = [chunk.destination, chunk.country]
        .filter(Boolean)
        .join(", ");
      const prefix = [chunk.title, location].filter(Boolean).join(" - ");
      return `- ${prefix}: ${compactContent(chunk.content)}`;
    }),
  ].join("\n");
}

const compactContent = (content: string): string =>
  content
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .slice(0, 260);
