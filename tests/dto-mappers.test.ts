import { describe, expect, it } from "vitest";

import { CreditTransactionDTOMapper } from "@/shared/dtos/credit";
import { ProfileDTOMapper } from "@/shared/dtos/profile";
import { TripPlanDTOMapper } from "@/shared/dtos/trip-plan";

describe("DTO mappers", () => {
  it("maps profile fields between API and DTO shapes", () => {
    const dto = ProfileDTOMapper.toDTO({
      id: "user-1",
      email: "user@example.com",
      display_name: "User",
      first_name: "First",
      last_name: "Last",
      gender: null,
      phone: null,
      bio: null,
      country: "BR",
      avatar_url: null,
      preferred_locale: "pt-BR",
      credits_balance: 20,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    });

    expect(dto.displayName).toBe("User");
    expect(dto.preferredLocale).toBe("pt-BR");
    expect(ProfileDTOMapper.toAPI(dto).credits_balance).toBe(20);
  });

  it("maps trip plan fields between API and DTO shapes", () => {
    const dto = TripPlanDTOMapper.toDTO({
      id: "plan-1",
      user_id: "user-1",
      title: "Tokyo",
      ai_suggested_title: "Tokyo Week",
      departure_at: null,
      arrival_at: null,
      flight_numbers: ["AA100"],
      days_count: 3,
      destination: "Tokyo",
      destination_country: "Japan",
      form_snapshot: { baseAnswers: { destination: "Tokyo" } },
      itinerary: { days: [] },
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    });

    expect(dto.userId).toBe("user-1");
    expect(dto.aiSuggestedTitle).toBe("Tokyo Week");
    expect(TripPlanDTOMapper.toAPI(dto).destination_country).toBe("Japan");
  });

  it("maps credit transaction fields between API and DTO shapes", () => {
    const dto = CreditTransactionDTOMapper.toDTO({
      id: "txn-1",
      user_id: "user-1",
      amount: -5,
      balance_after: 15,
      reason: "plan_generate",
      reference_type: "trip_plan",
      reference_id: "plan-1",
      metadata: { source: "test" },
      created_at: "2026-01-01T00:00:00Z",
    });

    expect(dto.balanceAfter).toBe(15);
    expect(dto.referenceType).toBe("trip_plan");
    expect(CreditTransactionDTOMapper.toAPI(dto).reference_id).toBe("plan-1");
  });
});
