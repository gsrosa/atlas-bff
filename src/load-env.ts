import dotenv from "dotenv";

/** `.env.local` overrides `.env` (same idea as Vite/Next). Missing files are ignored. */
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
