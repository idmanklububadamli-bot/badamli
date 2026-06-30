// alter_schema.js
import pg from 'pg';

const { Client } = pg;

const password = 'Badamli.19901990';
const projectRef = 'qfdqaodopvtiqzodlytr';

const connectionStrings = [
  `postgres://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgres://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
];

async function alterSql() {
  let client;
  let connected = false;

  for (const connStr of connectionStrings) {
    try {
      console.log(`Database-ə qoşulma cəhdi edilir...`);
      client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();
      connected = true;
      console.log("Uğurla qoşuldu!");
      break;
    } catch (err) {
      console.warn("Bu qoşulma cəhdi uğursuz oldu:", err.message);
    }
  }

  if (!connected) {
    console.error("XƏTƏ: Database-ə qoşulmaq mümkün olmadı.");
    process.exit(1);
  }

  try {
    console.log("ALTER SQL skripti icra olunur...");
    
    // 1. Create roster_athletes table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS roster_athletes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birth_date DATE,
        gender TEXT,
        club TEXT NOT NULL,
        country TEXT DEFAULT 'AZE',
        coach_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("roster_athletes cədvəli yaradıldı/yoxlanıldı.");

    // 2. Add checked_in column to athletes if not exists
    await client.query(`
      ALTER TABLE athletes ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;
    `);
    
    // 3. Add checked_in_at column to athletes if not exists
    await client.query(`
      ALTER TABLE athletes ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;
    `);

    // 4. Add roster_athlete_id column to athletes if not exists
    await client.query(`
      ALTER TABLE athletes ADD COLUMN IF NOT EXISTS roster_athlete_id TEXT REFERENCES roster_athletes(id) ON DELETE SET NULL;
    `);
    
    console.log("athletes cədvəli uğurla güncəlləndi!");
  } catch (err) {
    console.error("SQL icra edilərkən xəta yarandı:", err.message);
  } finally {
    await client.end();
  }
}

alterSql();
