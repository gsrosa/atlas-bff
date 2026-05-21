import {
  HOTEL_ENRICH_PROMPT_VERSION,
  HOTEL_ENRICH_SYSTEM_PROMPT,
} from "@/ai/prompts";
import type { Env } from "@/env";
import {
  type HotelEnrichOutput,
  hotelEnrichOutputSchema,
} from "@/shared/validation-schema/ai-output";

import { generate } from "./generation-core";

export class HotelEnrichService {
  static async enrichHotelInfo(
    env: Env,
    name: string,
    destination: string,
    checkinDate?: string,
    checkoutDate?: string,
  ): Promise<HotelEnrichOutput> {
    const userPrompt =
      `Hotel: ${name}\nDestination: ${destination}` +
      (checkinDate ? `\nCheck-in: ${checkinDate}` : "") +
      (checkoutDate ? `\nCheck-out: ${checkoutDate}` : "") +
      `\n\nReturn structured information about this hotel.`;

    return generate({
      env,
      endpoint: "hotel-enrich",
      promptVersion: HOTEL_ENRICH_PROMPT_VERSION,
      schema: hotelEnrichOutputSchema,
      system: HOTEL_ENRICH_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 1024,
      temperature: 0.2,
    });
  }
}
