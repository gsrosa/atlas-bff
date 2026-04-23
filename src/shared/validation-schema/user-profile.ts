import { z } from "zod";

export const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say"]);

export const patchProfileInputSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  first_name: z.string().min(1).max(120).optional(),
  last_name: z.string().min(1).max(120).optional(),
  gender: genderSchema.optional(),
  phone: z.string().max(40).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  country: z.string().length(2).optional(),
  avatar_url: z.string().url().max(2048).optional().or(z.literal("")),
  preferred_locale: z.enum(["en-US", "pt-BR", "es-ES"]).optional().or(z.null()),
});
