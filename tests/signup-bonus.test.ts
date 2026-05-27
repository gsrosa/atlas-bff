import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreditsModel } from "@/models/credits.model";
import { UserProfileModel } from "@/models/user-profile.model";
import {
  SIGNUP_BONUS_CREDITS,
  UserProfileService,
} from "@/services/user-profile.service";

import { buildTestEnv } from "./helpers/test-env";

vi.mock("@/models/credits.model", () => ({
  CreditsModel: {
    applyCredit: vi.fn(),
    upsertBalance: vi.fn(),
  },
}));

vi.mock("@/models/user-profile.model", () => ({
  UserProfileModel: {
    insertProfile: vi.fn(),
  },
}));

const mockedCreditsModel = vi.mocked(CreditsModel);
const mockedUserProfileModel = vi.mocked(UserProfileModel);

describe("signup bonus credits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUserProfileModel.insertProfile.mockResolvedValue(undefined);
    mockedCreditsModel.applyCredit.mockResolvedValue({ balance: SIGNUP_BONUS_CREDITS });
  });

  it("grants 15 free credits when creating the user's credits row", async () => {
    mockedCreditsModel.upsertBalance.mockResolvedValue({ inserted: true });

    await UserProfileService.ensureProfileAndCreditsRows(
      buildTestEnv(),
      "user-1",
      "user@example.com",
      "Test User",
    );

    expect(mockedUserProfileModel.insertProfile).toHaveBeenCalledWith(
      expect.any(Object),
      "user-1",
      "Test User",
    );
    expect(mockedCreditsModel.applyCredit).toHaveBeenCalledWith(expect.any(Object), {
      userId: "user-1",
      delta: 15,
      reason: "signup_bonus",
      referenceType: "topup",
      metadata: undefined,
    });
  });

  it("does not grant the signup bonus again when the credits row already exists", async () => {
    mockedCreditsModel.upsertBalance.mockResolvedValue({ inserted: false });

    await UserProfileService.ensureProfileAndCreditsRows(
      buildTestEnv(),
      "user-1",
      "user@example.com",
    );

    expect(mockedCreditsModel.applyCredit).not.toHaveBeenCalled();
  });
});
