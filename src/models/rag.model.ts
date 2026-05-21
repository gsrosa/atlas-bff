import type { Env } from "@/env";
import { createServiceClient } from "@/lib/supabase";
import type { DestinationKnowledgeApi } from "@/shared/dtos/destination-knowledge";
import { InternalServerError } from "@/shared/errors";

type KnowledgeRow = {
  id?: string;
  destination: string;
  country?: string | null;
  title: string;
  content: string;
  source_url?: string | null;
  metadata?: Record<string, unknown>;
  embedding: number[];
};

type MatchDestinationKnowledgeParams = {
  embedding: number[];
  matchCount: number;
  matchThreshold: number;
  destinationFilter?: string | null;
  countryFilter?: string | null;
};

export class RagModel {
  static async matchDestinationKnowledge(
    env: Env,
    params: MatchDestinationKnowledgeParams,
  ): Promise<unknown[]> {
    const client = createServiceClient(env);
    const { data, error } = await client.rpc("match_destination_knowledge", {
      query_embedding: params.embedding,
      match_count: params.matchCount,
      match_threshold: params.matchThreshold,
      destination_filter: params.destinationFilter ?? null,
      country_filter: params.countryFilter ?? null,
    });
    if (error) {
      throw new InternalServerError(
        `Destination context retrieval failed: ${error.message}`,
        error,
      );
    }
    return data ?? [];
  }

  static async upsertKnowledge(
    env: Env,
    row: KnowledgeRow,
  ): Promise<DestinationKnowledgeApi> {
    const client = createServiceClient(env);
    const { data, error } = await client
      .from("destination_knowledge")
      .upsert(
        {
          id: row.id,
          destination: row.destination,
          country: row.country ?? null,
          title: row.title,
          content: row.content,
          source_url: row.source_url ?? null,
          metadata: row.metadata ?? {},
          embedding: row.embedding,
        },
        { onConflict: "id" },
      )
      .select()
      .single();
    if (error) {
      throw new InternalServerError(
        `Destination knowledge upsert failed: ${error.message}`,
        error,
      );
    }
    return data as DestinationKnowledgeApi;
  }

  static async deleteKnowledge(env: Env, id: string): Promise<void> {
    const client = createServiceClient(env);
    const { error } = await client
      .from("destination_knowledge")
      .delete()
      .eq("id", id);
    if (error) {
      throw new InternalServerError(
        `Destination knowledge delete failed: ${error.message}`,
        error,
      );
    }
  }
}
