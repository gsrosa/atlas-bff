import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { loadEnv } from "@/env";
import {
  upsertKnowledge,
  type UpsertKnowledgeInput,
} from "@/services/rag.service";

const DEFAULT_SEED_PATH = "scripts/destination-knowledge.seed.json";

async function main() {
  const seedPath = process.argv[2] ?? DEFAULT_SEED_PATH;
  const fullPath = resolve(process.cwd(), seedPath);
  const raw = await readFile(fullPath, "utf8");
  const entries = JSON.parse(raw) as UpsertKnowledgeInput[];
  const env = loadEnv();

  for (const entry of entries) {
    const row = await upsertKnowledge(env, entry);
    console.log(
      `seeded ${row.destination}${row.country ? `, ${row.country}` : ""}: ${row.title}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
