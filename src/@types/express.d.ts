import type { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      /** Set by `require-bearer-auth` after successful auth (cookie session or Bearer). */
      atlasAccessToken?: string;
      atlasUser?: User;
      /** Set when auth used the httpOnly session cookie. */
      atlasSessionId?: string;
    }
  }
}

export {};
