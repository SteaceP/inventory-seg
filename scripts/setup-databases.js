import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const isCI =
  process.env.GITHUB_ACTIONS === "true" || process.env.ACT === "true";

async function setupPostgres() {
  console.log("--- Setting up Postgres (Supabase emulation) ---");

  const connectionString =
    process.env.POSTGRES_URL ||
    "postgresql://postgres:postgres@localhost:5432/postgres";
  const sql = postgres(connectionString);

  try {
    const migrationsDir = path.join(rootDir, "supabase/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.warn("Supabase migrations directory not found.");
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      // Split by semicolon might be dangerous for complex functions,
      // but postgres package handles multi-statement strings if they are valid SQL.
      await sql.unsafe(content);
    }
    console.log("All Supabase migrations applied successfully.");
  } catch (err) {
    console.error("Error setting up Postgres:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function setupSQLite() {
  console.log("--- Setting up SQLite (D1 emulation) ---");

  // For D1 emulation in CI, we usually just need the schema file to be applied to a local sqlite file.
  // Wrangler/Miniflare might handle this if properly configured, but a manual setup is more robust for CI scripts.
  const d1SchemaPath = path.join(rootDir, "src/worker/db/d1_schema.sql");
  if (!fs.existsSync(d1SchemaPath)) {
    console.warn("D1 schema file not found.");
    return;
  }

  const dbPath = path.join(rootDir, "d1-local.sqlite");
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  console.log(
    "D1 setup will be handled via wrangler/miniflare during dev server startup or manual execute."
  );
  // For now, let's just ensure the migrations are available.
}

async function main() {
  await setupPostgres();
  await setupSQLite();
}

main();
