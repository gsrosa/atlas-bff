import type { Env } from "@/env";
import { createServiceClient } from "@/lib/supabase";

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
  const client = createServiceClient(env);
  const { data, error } = await client.rpc("match_destination_knowledge", {
    query_embedding: embedding,
    match_count: opts.limit ?? 5,
    match_threshold: opts.threshold ?? 0.75,
    destination_filter: opts.destination ?? null,
    country_filter: opts.country ?? null,
  });

  if (error) {
    throw new Error(`Destination context retrieval failed: ${error.message}`);
  }

  return ((data ?? []) as DestinationKnowledgeRow[]).map((row) => ({
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
