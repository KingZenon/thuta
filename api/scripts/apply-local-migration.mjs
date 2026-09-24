import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const migrationName = "20260912150000_init";
const migrationUrl = new URL(`../prisma/migrations/${migrationName}/migration.sql`, import.meta.url);
const databasePath = fileURLToPath(new URL("../prisma/dev.db", import.meta.url));
const sql = readFileSync(migrationUrl, "utf8");
const checksum = createHash("sha256").update(sql).digest("hex");
const db = new DatabaseSync(databasePath);

db.exec("PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  );
`);

const applied = db.prepare('SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = ?').get(migrationName);
if (!applied) {
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.exec(sql);
    db.prepare(`INSERT INTO "_prisma_migrations"
      ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, 1)`)
      .run(randomUUID(), checksum, migrationName);
    db.exec("COMMIT;");
    console.log(`Applied migration ${migrationName} to ${databasePath}`);
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
} else {
  console.log(`Migration ${migrationName} is already applied.`);
}

db.close();
