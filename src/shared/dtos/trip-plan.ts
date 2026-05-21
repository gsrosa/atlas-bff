import type { z } from "zod";

import type { TripItineraryDocument } from "@/shared/dtos/itinerary-ai";
import type {
  createTripPlanInputSchema,
  patchTripPlanInputSchema,
} from "@/shared/validation-schema/trip-plans";

type CreateTripPlanInput = z.infer<typeof createTripPlanInputSchema>;
type PatchTripPlanInput = z.infer<typeof patchTripPlanInputSchema>;

export type TripFormSnapshot = {
  baseAnswers?: Record<string, string | string[]>;
  aiQuestions?: unknown[];
  aiAnswers?: Record<string, string | string[]>;
  [key: string]: unknown;
};

export type TripPlanApi = {
  id: string;
  user_id: string;
  title: string | null;
  ai_suggested_title: string | null;
  departure_at: string | null;
  arrival_at: string | null;
  flight_numbers: string[];
  days_count: number | null;
  destination: string | null;
  destination_country: string | null;
  form_snapshot: TripFormSnapshot;
  itinerary: TripItineraryDocument | Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TripPlanApiInput = Omit<
  TripPlanApi,
  "id" | "created_at" | "updated_at"
>;

export type TripPlanDTO = {
  id: string;
  userId: string;
  title: string | null;
  aiSuggestedTitle: string | null;
  departureAt: string | null;
  arrivalAt: string | null;
  flightNumbers: string[];
  daysCount: number | null;
  destination: string | null;
  destinationCountry: string | null;
  formSnapshot: TripFormSnapshot;
  itinerary: TripItineraryDocument | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type TripPlanResponseDTO = {
  plan: TripPlanDTO;
};

export type TripPlansResponseDTO = {
  plans: TripPlanDTO[];
  total: number;
  page: number;
  limit: number;
};

export class TripPlanDTOMapper {
  static toResponse(api: TripPlanApi): TripPlanResponseDTO {
    return { plan: TripPlanDTOMapper.toDTO(api) };
  }

  static toListResponse(params: {
    plans: TripPlanApi[];
    total: number;
    page: number;
    limit: number;
  }): TripPlansResponseDTO {
    return {
      plans: params.plans.map(TripPlanDTOMapper.toDTO),
      total: params.total,
      page: params.page,
      limit: params.limit,
    };
  }

  static createInputToAPI(
    userId: string,
    input: CreateTripPlanInput,
  ): TripPlanApiInput {
    return {
      user_id: userId,
      title: input.title ?? null,
      ai_suggested_title: input.aiSuggestedTitle ?? null,
      departure_at: input.departureAt ?? null,
      arrival_at: input.arrivalAt ?? null,
      flight_numbers: input.flightNumbers,
      days_count: input.daysCount ?? null,
      destination: input.destination ?? null,
      destination_country: input.destinationCountry ?? null,
      form_snapshot: input.formSnapshot,
      itinerary: input.itinerary,
    };
  }

  static patchInputToAPI(input: PatchTripPlanInput): Partial<TripPlanApi> {
    const updates: Partial<TripPlanApi> = {
      updated_at: new Date().toISOString(),
    };
    if (input.title !== undefined) updates.title = input.title;
    if (input.aiSuggestedTitle !== undefined) {
      updates.ai_suggested_title = input.aiSuggestedTitle;
    }
    if (input.departureAt !== undefined)
      updates.departure_at = input.departureAt;
    if (input.arrivalAt !== undefined) updates.arrival_at = input.arrivalAt;
    if (input.flightNumbers !== undefined) {
      updates.flight_numbers = input.flightNumbers;
    }
    if (input.flights !== undefined) {
      updates.flight_numbers = input.flights
        .map((flight) => flight.flightNumber)
        .filter(Boolean);
    }
    if (input.daysCount !== undefined) updates.days_count = input.daysCount;
    if (input.destination !== undefined)
      updates.destination = input.destination;
    if (input.destinationCountry !== undefined) {
      updates.destination_country = input.destinationCountry;
    }
    if (input.formSnapshot !== undefined)
      updates.form_snapshot = input.formSnapshot;
    if (input.itinerary !== undefined) updates.itinerary = input.itinerary;
    return updates;
  }

  static toDTO(api: TripPlanApi): TripPlanDTO {
    return {
      id: api.id,
      userId: api.user_id,
      title: api.title,
      aiSuggestedTitle: api.ai_suggested_title,
      departureAt: api.departure_at,
      arrivalAt: api.arrival_at,
      flightNumbers: api.flight_numbers,
      daysCount: api.days_count,
      destination: api.destination,
      destinationCountry: api.destination_country,
      formSnapshot: api.form_snapshot,
      itinerary: api.itinerary,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
    };
  }

  static toAPI(dto: TripPlanDTO): TripPlanApi {
    return {
      id: dto.id,
      user_id: dto.userId,
      title: dto.title,
      ai_suggested_title: dto.aiSuggestedTitle,
      departure_at: dto.departureAt,
      arrival_at: dto.arrivalAt,
      flight_numbers: dto.flightNumbers,
      days_count: dto.daysCount,
      destination: dto.destination,
      destination_country: dto.destinationCountry,
      form_snapshot: dto.formSnapshot,
      itinerary: dto.itinerary,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
    };
  }
}
