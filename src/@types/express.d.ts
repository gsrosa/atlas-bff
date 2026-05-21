import type { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      nexploringAccessToken?: string;
      nexploringUser?: User;
      nexploringSessionId?: string;
    }
  }
}

export {};
