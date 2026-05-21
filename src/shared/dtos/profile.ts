export type ProfileApi = {
  id: string;
  email: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  phone: string | null;
  bio: string | null;
  country: string | null;
  avatar_url: string | null;
  preferred_locale: string | null;
  credits_balance: number;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = Omit<ProfileApi, "email" | "credits_balance">;

export type ProfileDTO = {
  id: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  phone: string | null;
  bio: string | null;
  country: string | null;
  avatarUrl: string | null;
  preferredLocale: string | null;
  creditsBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfileResponseDTO = {
  profile: ProfileDTO | null;
};

export class ProfileDTOMapper {
  static toResponse(
    row: ProfileRow | null,
    params: { email?: string; creditsBalance: number },
  ): ProfileResponseDTO {
    if (!row) return { profile: null };
    return {
      profile: ProfileDTOMapper.toDTO({
        ...row,
        email: params.email ?? null,
        credits_balance: params.creditsBalance,
      }),
    };
  }

  static toDTO(api: ProfileApi): ProfileDTO {
    return {
      id: api.id,
      email: api.email,
      displayName: api.display_name,
      firstName: api.first_name,
      lastName: api.last_name,
      gender: api.gender,
      phone: api.phone,
      bio: api.bio,
      country: api.country,
      avatarUrl: api.avatar_url,
      preferredLocale: api.preferred_locale,
      creditsBalance: api.credits_balance,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
    };
  }

  static toAPI(dto: ProfileDTO): ProfileApi {
    return {
      id: dto.id,
      email: dto.email,
      display_name: dto.displayName,
      first_name: dto.firstName,
      last_name: dto.lastName,
      gender: dto.gender,
      phone: dto.phone,
      bio: dto.bio,
      country: dto.country,
      avatar_url: dto.avatarUrl,
      preferred_locale: dto.preferredLocale,
      credits_balance: dto.creditsBalance,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
    };
  }
}
