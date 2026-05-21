export type DestinationKnowledgeApi = {
  id: string;
  destination: string;
  country: string | null;
  title: string;
  content: string;
  source_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type DestinationKnowledgeDTO = {
  id: string;
  destination: string;
  country?: string;
  title: string;
  content: string;
  sourceUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export class DestinationKnowledgeDTOMapper {
  static toDTO(api: DestinationKnowledgeApi): DestinationKnowledgeDTO {
    return {
      id: api.id,
      destination: api.destination,
      country: api.country ?? undefined,
      title: api.title,
      content: api.content,
      sourceUrl: api.source_url ?? undefined,
      metadata: api.metadata ?? {},
      createdAt: api.created_at,
      updatedAt: api.updated_at,
    };
  }

  static toAPI(dto: DestinationKnowledgeDTO): DestinationKnowledgeApi {
    return {
      id: dto.id,
      destination: dto.destination,
      country: dto.country ?? null,
      title: dto.title,
      content: dto.content,
      source_url: dto.sourceUrl ?? null,
      metadata: dto.metadata,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
    };
  }
}
