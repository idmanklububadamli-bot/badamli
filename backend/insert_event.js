import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('events').insert([
    {
      id: '9042',
      title: 'Yeni Turnir',
      date: '2026-06-22',
      location: 'Bakı, Azərbaycan',
      location_url: '',
      description: 'Yeni turnir üçün qeydiyyat və idarəetmə',
      status: 'upcoming',
      registration_status: 'open'
    }
  ]);
  
  if (error) {
    console.error('Error inserting event:', error);
  } else {
    console.log('Event 9042 inserted successfully');
  }
}

run();
