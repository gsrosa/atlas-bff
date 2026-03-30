import type { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      /** Set by `require-bearer-auth` middleware after successful JWT validation. */
      atlasAccessToken?: string;
      atlasUser?: User;
    }
  }
}

export {};
