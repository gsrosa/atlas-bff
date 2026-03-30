import { z } from "zod";

export const patchProfileInputSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  avatar_url: z.string().url().max(2048).optional().or(z.literal("")),
});
