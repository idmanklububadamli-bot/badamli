// alter_schema_supabase.js
// Supabase service role üzərindən verilənlər bazası strukturunu güncəlləyir
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("XƏTƏ: SUPABASE_URL və ya SUPABASE_SERVICE_ROLE_KEY tapılmadı!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runAlter() {
  console.log("Supabase vasitəsilə schema güncəllənməsi başladılır...\n");

  const steps = [
    {
      label: "roster_athletes cədvəlinin yaradılması",
      sql: `
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
      `
    },
    {
      label: "athletes.checked_in sütununun əlavə edilməsi",
      sql: `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;`
    },
    {
      label: "athletes.checked_in_at sütununun əlavə edilməsi",
      sql: `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;`
    },
    {
      label: "athletes.roster_athlete_id sütununun əlavə edilməsi",
      sql: `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS roster_athlete_id TEXT REFERENCES roster_athletes(id) ON DELETE SET NULL;`
    },
  ];

  for (const step of steps) {
    try {
      const { error } = await supabase.rpc('exec_sql', { query: step.sql });
      if (error) {
        // Try using the SQL editor approach via postgres extension
        console.warn(`[WARN] RPC uğursuz oldu (${step.label}):`, error.message);
        console.log(`       Bu addımı Supabase Dashboard > SQL Editor-da əl ilə icra edin.`);
      } else {
        console.log(`[OK]  ${step.label}`);
      }
    } catch(e) {
      console.warn(`[WARN] ${step.label}: ${e.message}`);
    }
  }

  // Verify roster_athletes table works by trying an insert/select
  console.log("\nYoxlama: roster_athletes cədvəli mövcuddurmu?");
  const { data, error } = await supabase.from('roster_athletes').select('id').limit(1);
  if (error) {
    console.log("❌ roster_athletes cədvəli hələ yaradılmayıb. Aşağıdakı SQL-i Supabase Dashboard-da icra edin.\n");
    console.log("=".repeat(60));
    console.log(`
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

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS roster_athlete_id TEXT REFERENCES roster_athletes(id) ON DELETE SET NULL;
    `);
    console.log("=".repeat(60));
    console.log("\nSQL-i kopyalayıb Supabase Dashboard > SQL Editor-da icra etdikdən sonra 'node alter_schema_supabase.js' yenidən işlədin.");
  } else {
    console.log("✅ roster_athletes cədvəli mövcuddur!");

    // Check athletes columns
    console.log("\nYoxlama: athletes.checked_in mövcuddurmu?");
    const { data: athRow } = await supabase.from('athletes').select('checked_in').limit(1);
    if (athRow !== null) {
      console.log("✅ athletes.checked_in sütunu mövcuddur!");
      console.log("\n✅ Bütün schema dəyişiklikləri hazırdır!");
    } else {
      console.log("⚠️  athletes.checked_in sütunu yoxdur. Yuxarıdakı ALTER SQL-ləri icra edin.");
    }
  }
}

runAlter();
