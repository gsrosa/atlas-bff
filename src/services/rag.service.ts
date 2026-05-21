import { embedText } from "@/ai/rag";
import type { Env } from "@/env";
import { createServiceClient } from "@/lib/supabase";

export interface UpsertKnowledgeInput {
  id?: string;
  destination: string;
  country?: string;
  title: string;
  content: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface DestinationKnowledgeDTO extends UpsertKnowledgeInput {
  id: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface DestinationKnowledgeRow {
  id: string;
  destination: string;
  country: string | null;
  title: string;
  content: string;
  source_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function buildKnowledgeEmbeddingText(input: UpsertKnowledgeInput): string {
  return [
    `Destination: ${input.destination}`,
    input.country ? `Country: ${input.country}` : "",
    `Title: ${input.title}`,
    input.content,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function upsertKnowledge(
  env: Env,
  input: UpsertKnowledgeInput,
): Promise<DestinationKnowledgeDTO> {
  const embedding = await embedText(env, buildKnowledgeEmbeddingText(input));
  const client = createServiceClient(env);

  const { data, error } = await client
    .from("destination_knowledge")
    .upsert(
      {
        id: input.id,
        destination: input.destination,
        country: input.country ?? null,
        title: input.title,
        content: input.content,
        source_url: input.sourceUrl ?? null,
        metadata: input.metadata ?? {},
        embedding,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Destination knowledge upsert failed: ${error.message}`);
  }

  return mapKnowledgeRow(data as DestinationKnowledgeRow);
}

export async function deleteKnowledge(env: Env, id: string): Promise<void> {
  const client = createServiceClient(env);
  const { error } = await client.from("destination_knowledge").delete().eq("id", id);

  if (error) {
    throw new Error(`Destination knowledge delete failed: ${error.message}`);
  }
}

function mapKnowledgeRow(row: DestinationKnowledgeRow): DestinationKnowledgeDTO {
  return {
    id: row.id,
    destination: row.destination,
    country: row.country ?? undefined,
    title: row.title,
    content: row.content,
    sourceUrl: row.source_url ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
