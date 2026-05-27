import type { z } from "zod";

import type { Env } from "@/env";
import { CreditsModel } from "@/models/credits.model";
import { UserProfileModel } from "@/models/user-profile.model";
import { CreditsService } from "@/services/credits.service";
import {
  type ProfileDTO,
  ProfileDTOMapper,
  type ProfileResponseDTO,
} from "@/shared/dtos/profile";
import { NotFoundError } from "@/shared/errors";
import { type patchProfileInputSchema } from "@/shared/validation-schema/user-profile";

type PatchProfileInput = z.infer<typeof patchProfileInputSchema>;

export const SIGNUP_BONUS_CREDITS = 15;

export class UserProfileService {
  static async getProfile(
    env: Env,
    accessToken: string,
    userId: string,
    email: string | undefined,
  ): Promise<ProfileResponseDTO> {
    let profile = await UserProfileModel.findByUserId(env, accessToken);

    if (!profile) {
      await UserProfileService.ensureProfileAndCreditsRows(env, userId, email);
      profile = await UserProfileModel.findByUserId(env, accessToken);
    }

    const { balance: credits_balance } =
      await UserProfileModel.findCreditsBalance(env, accessToken, userId);

    if (!profile) {
      return ProfileDTOMapper.toResponse(null, {
        email,
        creditsBalance: credits_balance,
      });
    }

    return ProfileDTOMapper.toResponse(profile, {
      email,
      creditsBalance: credits_balance,
    });
  }

  static async updateProfile(
    env: Env,
    accessToken: string,
    userId: string,
    input: PatchProfileInput,
    email: string | undefined,
  ): Promise<{ profile: ProfileDTO }> {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.display_name !== undefined)
      updates.display_name = input.display_name;
    if (input.first_name !== undefined) updates.first_name = input.first_name;
    if (input.last_name !== undefined) updates.last_name = input.last_name;
    if (input.gender !== undefined) updates.gender = input.gender;
    if (input.phone !== undefined)
      updates.phone = input.phone === "" ? null : input.phone;
    if (input.bio !== undefined)
      updates.bio = input.bio === "" ? null : input.bio;
    if (input.country !== undefined) updates.country = input.country;
    if (input.avatar_url !== undefined) {
      updates.avatar_url = input.avatar_url === "" ? null : input.avatar_url;
    }
    if (input.preferred_locale !== undefined)
      updates.preferred_locale = input.preferred_locale ?? null;

    await UserProfileModel.update(env, accessToken, userId, updates);

    const out = await UserProfileService.getProfile(
      env,
      accessToken,
      userId,
      email,
    );
    if (!out.profile) {
      throw new NotFoundError("Profile not found");
    }
    return { profile: out.profile };
  }

  static async ensureProfileAndCreditsRows(
    env: Env,
    userId: string,
    email: string | undefined,
    displayName?: string,
  ): Promise<void> {
    const profileDisplayName = displayName || (email ? email.split("@")[0] : "User");

    const [, { inserted }] = await Promise.all([
      UserProfileModel.insertProfile(env, userId, profileDisplayName),
      CreditsModel.upsertBalance(env, userId),
    ]);
    if (inserted) {
      await CreditsService.addFundsForUser(
        env,
        userId,
        SIGNUP_BONUS_CREDITS,
        "signup_bonus",
      );
    }
  }
}
