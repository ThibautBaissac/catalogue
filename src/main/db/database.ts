import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import fs from 'fs';
import { initializeTestData } from './initTestData';

// Use a stable application data folder so the DB path is consistent in dev/prod
const appDataBase = app.getPath('appData');
const appDataDir = join(appDataBase, 'catalogue');
if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}
const dbPath = join(appDataDir, 'catalogue.db');
const db = new Database(dbPath);

// Active WAL pour meilleure sécurité et résilience
db.pragma('journal_mode = WAL');

// Initialise le schéma si nécessaire
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
const artworkExists = tables.find((t: any) => t.name === 'artworks');

if (!artworkExists) {
  const schema = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  // Initialize test data for development
  if (process.env.NODE_ENV === 'development') {
    initializeTestData();
  }
}

export default db;
