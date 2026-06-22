// clear_data.js
// Supabase cədvəllərindəki bütün məlumatları silir, cədvəllərin özünü saxlayır

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function clearData() {
  console.log("Bütün datalar silinir...\n");

  // Əvvəlcə foreign key asılılıqları olan cədvəlləri sil
  const { error: e1 } = await supabase.from('matches').delete().neq('id', '');
  if (e1) console.error("matches silinərkən xəta:", e1.message);
  else console.log("✅ matches cədvəli təmizləndi");

  const { error: e2 } = await supabase.from('athletes').delete().neq('id', '');
  if (e2) console.error("athletes silinərkən xəta:", e2.message);
  else console.log("✅ athletes cədvəli təmizləndi");

  const { error: e3 } = await supabase.from('categories').delete().neq('id', '');
  if (e3) console.error("categories silinərkən xəta:", e3.message);
  else console.log("✅ categories cədvəli təmizləndi");

  const { error: e4 } = await supabase.from('events').delete().neq('id', '');
  if (e4) console.error("events silinərkən xəta:", e4.message);
  else console.log("✅ events cədvəli təmizləndi");

  console.log("\nBütün datalar silindi! Cədvəllər boş qaldı.");
}

clearData().catch(console.error);
