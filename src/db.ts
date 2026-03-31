import postgres from "postgres";

let sql: postgres.Sql | undefined;

/**
 * Direct Postgres (server-only). Use for raw SQL when `@supabase/supabase-js` is not enough.
 * Requires `DATABASE_URL` in `.env` / `.env.local` (Supabase Dashboard → Connect → URI).
 */
export function getSql(): postgres.Sql {
  if (sql) return sql;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres — see .env.example",
    );
  }
  sql = postgres(connectionString, {
    ssl:
      connectionString.includes("127.0.0.1") || connectionString.includes("localhost")
        ? false
        : "require",
  });
  return sql;
}

/** Default: same as `getSql()` — use as `sql()`\`SELECT 1\``. */
export default getSql;
