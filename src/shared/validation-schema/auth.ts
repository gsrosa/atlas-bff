import { z } from "zod";

import { genderSchema } from "@/shared/validation-schema/user-profile";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const signUpInputSchema = z.object({
  email: z.string().email().max(320),
  password: passwordSchema,
  firstName: z.string().min(1).max(120),
  lastName: z.string().min(1).max(120),
  gender: genderSchema,
  phone: z.string().max(40).optional(),
  bio: z.string().max(2000).optional(),
  country: z.string().length(2),
});

export const signInInputSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

export const refreshInputSchema = z.object({
  refresh_token: z.string().min(1),
});

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});
