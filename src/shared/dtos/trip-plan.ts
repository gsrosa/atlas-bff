import type { TripItineraryDocument } from "@/shared/dtos/itinerary-ai";

/** Wizard + AI answers snapshot (matches atlas-ai-assistant form state). */
export type TripFormSnapshot = {
  baseAnswers?: Record<string, string | string[]>;
  aiQuestions?: unknown[];
  aiAnswers?: Record<string, string | string[]>;
  [key: string]: unknown;
};

export type TripPlanDTO = {
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
