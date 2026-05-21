import { config } from 'dotenv';
import { readdirSync,readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import postgres from 'postgres';

// Load .env.local (local dev) then fall back to .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  process.stderr.write('DATABASE_URL is not set. Add it to .env.local.\n');
  process.exit(1);
}

const MIGRATIONS_DIR = resolve(process.cwd(), 'supabase/migrations');

const sql = postgres(DATABASE_URL, { max: 1 });

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const applied = new Set(
    (await sql`SELECT name FROM _migrations`).map((r) => r.name as string),
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    process.stdout.write('No pending migrations.\n');
    await sql.end();
    return;
  }

  for (const file of pending) {
    const filePath = join(MIGRATIONS_DIR, file);
    const content = readFileSync(filePath, 'utf8');
    process.stdout.write(`Applying ${file}...\n`);
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`INSERT INTO _migrations (name) VALUES (${file})`;
    });
    process.stdout.write(`  done ${file}\n`);
  }

  process.stdout.write(`\nDone: ${pending.length} migration(s) applied.\n`);
  await sql.end();
}

run().catch((err) => {
  process.stderr.write(`Migration failed: ${String(err)}\n`);
  process.exit(1);
});
