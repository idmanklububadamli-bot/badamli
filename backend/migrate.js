// migrate.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'data.json');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_project_url') || supabaseKey.includes('your-service-role-key')) {
  console.error("HƏTƏ: Zəhmət olmasa backend qovluğundakı .env faylında SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY sahələrini doldurun!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log("Miqrasiya başladılır...");

  if (!fs.existsSync(DB_FILE)) {
    console.error(`XƏTƏ: ${DB_FILE} tapılmadı!`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DB_FILE, 'utf8');
  const data = JSON.parse(rawData);

  // 1. Events miqrasiyası
  console.log(`\n1/4: ${data.events.length} turnir köçürülür...`);
  for (const event of data.events) {
    const { error } = await supabase.from('events').upsert({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      location_url: event.locationUrl,
      description: event.description,
      status: event.status,
      registration_status: event.registrationStatus
    });
    if (error) console.error(`Turnir (${event.id}) köçürülərkən xəta:`, error.message);
  }

  // 2. Categories miqrasiyası
  console.log(`\n2/4: ${data.categories.length} kateqoriya köçürülür...`);
  for (const cat of data.categories) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      event_id: cat.eventId,
      name: cat.name,
      gender: cat.gender,
      age: cat.age,
      weight: cat.weight,
      type: cat.type
    });
    if (error) console.error(`Kateqoriya (${cat.id}) köçürülərkən xəta:`, error.message);
  }

  // 3. Athletes miqrasiyası
  console.log(`\n3/4: ${data.athletes.length} idmançı köçürülür...`);
  for (const ath of data.athletes) {
    const { error } = await supabase.from('athletes').upsert({
      id: ath.id,
      name: ath.name,
      club: ath.club,
      country: ath.country,
      category_id: ath.categoryId
    });
    if (error) console.error(`İdmançı (${ath.id}) köçürülərkən xəta:`, error.message);
  }

  // 4. Matches miqrasiyası
  console.log(`\n4/4: ${data.matches.length} matç köçürülür...`);
  for (const m of data.matches) {
    const { error } = await supabase.from('matches').upsert({
      id: m.id,
      event_id: m.eventId,
      category_id: m.categoryId,
      round_name: m.roundName,
      round_index: m.roundIndex,
      match_index: m.matchIndex,
      athlete_aka_id: m.athleteAkaId,
      athlete_ao_id: m.athleteAoId,
      score_aka: m.scoreAka,
      score_ao: m.scoreAo,
      kata_scores_aka: m.kataScoresAka,
      kata_scores_ao: m.kataScoresAo,
      warnings_aka: m.warningsAka,
      warnings_ao: m.warningsAo,
      senshu: m.senshu,
      winner_id: m.winnerId,
      status: m.status,
      next_match_id: m.nextMatchId,
      next_match_position: m.nextMatchPosition
    });
    if (error) console.error(`Matç (${m.id}) köçürülərkən xəta:`, error.message);
  }

  console.log("\nMiqrasiya tamamlandı! Təşəkkürlər.");
}

runMigration().catch(err => {
  console.error("Gözlənilməyən xəta yarandı:", err);
});
