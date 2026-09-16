import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL manquant. Ajoute-le dans .env (connexion Postgres Supabase).");
    process.exit(1);
  }

  const sql = postgres(connectionString, { ssl: "require", max: 1, prepare: false });
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");

  console.log("Application du schéma sur la base Supabase...");
  await sql.unsafe(schema);
  console.log("Schéma appliqué avec succès.");

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
