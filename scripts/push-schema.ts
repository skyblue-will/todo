import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      completed BOOLEAN NOT NULL DEFAULT false,
      position INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ todos table created");

  // Add columns if they don't exist (migrations)
  await sql`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT ''
  `;
  console.log("✓ notes column ensured");

  await sql`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS do_now BOOLEAN NOT NULL DEFAULT false
  `;
  console.log("✓ do_now column ensured");

  await sql`
    CREATE TABLE IF NOT EXISTS daily_trackers (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      water_count INTEGER NOT NULL DEFAULT 0,
      fruit_count INTEGER NOT NULL DEFAULT 0
    )
  `;
  console.log("✓ daily_trackers table ensured");
}

main().catch(console.error);
