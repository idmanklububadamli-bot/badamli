// apply_schema.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlFile = path.join(__dirname, 'schema.sql');

const password = 'Badamli.19901990';
const projectRef = 'qfdqaodopvtiqzodlytr';

// Try direct host first, then pooler host if it fails
const connectionStrings = [
  `postgres://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgres://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
];

async function applySql() {
  const sql = fs.readFileSync(sqlFile, 'utf8');
  let client;
  let connected = false;

  for (const connStr of connectionStrings) {
    try {
      console.log(`Verilənlər bazasına qoşulma cəhdi edilir...`);
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
    console.error("XƏTƏ: Heç bir qoşulma linki ilə qoşulmaq mümkün olmadı. Zəhmət olmasa internetinizi və ya database parolunu yoxlayın.");
    process.exit(1);
  }

  try {
    console.log("SQL skripti icra olunur...");
    await client.query(sql);
    console.log("Cədvəllər uğurla yaradıldı!");
  } catch (err) {
    console.error("SQL icra edilərkən xəta yarandı:", err.message);
  } finally {
    await client.end();
  }
}

applySql();
