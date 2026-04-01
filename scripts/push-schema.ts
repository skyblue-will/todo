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

  // Add notes column if it doesn't exist (migration)
  await sql`
    ALTER TABLE todos ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT ''
  `;
  console.log("✓ notes column ensured");
}

main().catch(console.error);
