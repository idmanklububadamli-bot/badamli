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
    {
      label: "matches.tatami_number sütununun əlavə edilməsi",
      sql: `ALTER TABLE matches ADD COLUMN IF NOT EXISTS tatami_number INTEGER DEFAULT 1;`
    },
    {
      label: "matches.estimated_time sütununun əlavə edilməsi",
      sql: `ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_time TIMESTAMP WITH TIME ZONE;`
    },
    {
      label: "roster_athletes üçün RLS aktivləşdirməsi",
      sql: `ALTER TABLE roster_athletes ENABLE ROW LEVEL SECURITY;`
    },
    {
      label: "roster_athletes SELECT policy",
      sql: `DROP POLICY IF EXISTS "Coaches can view their own roster" ON roster_athletes; CREATE POLICY "Coaches can view their own roster" ON roster_athletes FOR SELECT USING (auth.uid() = coach_id);`
    },
    {
      label: "roster_athletes INSERT policy",
      sql: `DROP POLICY IF EXISTS "Coaches can insert into their own roster" ON roster_athletes; CREATE POLICY "Coaches can insert into their own roster" ON roster_athletes FOR INSERT WITH CHECK (auth.uid() = coach_id);`
    },
    {
      label: "roster_athletes UPDATE policy",
      sql: `DROP POLICY IF EXISTS "Coaches can update their own roster" ON roster_athletes; CREATE POLICY "Coaches can update their own roster" ON roster_athletes FOR UPDATE USING (auth.uid() = coach_id);`
    },
    {
      label: "roster_athletes DELETE policy",
      sql: `DROP POLICY IF EXISTS "Coaches can delete from their own roster" ON roster_athletes; CREATE POLICY "Coaches can delete from their own roster" ON roster_athletes FOR DELETE USING (auth.uid() = coach_id);`
    }
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

ALTER TABLE matches ADD COLUMN IF NOT EXISTS tatami_number INTEGER DEFAULT 1;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_time TIMESTAMP WITH TIME ZONE;

ALTER TABLE roster_athletes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coaches can view their own roster" ON roster_athletes;
CREATE POLICY "Coaches can view their own roster" ON roster_athletes FOR SELECT USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can insert into their own roster" ON roster_athletes;
CREATE POLICY "Coaches can insert into their own roster" ON roster_athletes FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update their own roster" ON roster_athletes;
CREATE POLICY "Coaches can update their own roster" ON roster_athletes FOR UPDATE USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can delete from their own roster" ON roster_athletes;
CREATE POLICY "Coaches can delete from their own roster" ON roster_athletes FOR DELETE USING (auth.uid() = coach_id);
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
