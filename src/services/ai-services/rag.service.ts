import { embedText } from "@/ai/rag";
import type { Env } from "@/env";
import { RagModel } from "@/models/rag.model";
import {
  type DestinationKnowledgeDTO,
  DestinationKnowledgeDTOMapper,
} from "@/shared/dtos/destination-knowledge";

export interface UpsertKnowledgeInput {
  id?: string;
  destination: string;
  country?: string;
  title: string;
  content: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export class RagService {
  static buildKnowledgeEmbeddingText(input: UpsertKnowledgeInput): string {
    return [
      `Destination: ${input.destination}`,
      input.country ? `Country: ${input.country}` : "",
      `Title: ${input.title}`,
      input.content,
    ]
      .filter(Boolean)
      .join("\n");
  }

  static async upsertKnowledge(
    env: Env,
    input: UpsertKnowledgeInput,
  ): Promise<DestinationKnowledgeDTO> {
    const embedding = await embedText(
      env,
      RagService.buildKnowledgeEmbeddingText(input),
    );

    const data = await RagModel.upsertKnowledge(env, {
      id: input.id,
      destination: input.destination,
      country: input.country ?? null,
      title: input.title,
      content: input.content,
      source_url: input.sourceUrl ?? null,
      metadata: input.metadata ?? {},
      embedding,
    });

    return DestinationKnowledgeDTOMapper.toDTO(data);
  }

  static async deleteKnowledge(env: Env, id: string): Promise<void> {
    await RagModel.deleteKnowledge(env, id);
  }
}
