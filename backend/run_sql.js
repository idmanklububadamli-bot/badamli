import fs from 'fs';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pkg;

const connectionString = `postgresql://postgres:${process.env.DB_PASSWORD}@db.qfdqaodopvtiqzodlytr.supabase.co:5432/postgres`;

async function run() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected to DB");
    
    const sql = fs.readFileSync('schema.sql', 'utf8');
    await client.query(sql);
    console.log("Schema applied successfully.");
    
  } catch (err) {
    console.error("Error applying schema:", err);
  } finally {
    await client.end();
  }
}

run();
