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
} else {
  // Handle schema migrations for existing databases
  const columns = db.prepare(`PRAGMA table_info(artworks)`).all();
  const hasPreviewImageId = columns.find((col: any) => col.name === 'preview_image_id');

  if (!hasPreviewImageId) {
    console.log('Migrating database: adding preview_image_id column to artworks table');
    db.prepare(`
      ALTER TABLE artworks
      ADD COLUMN preview_image_id INTEGER
      REFERENCES artwork_images(id) ON DELETE SET NULL
    `).run();
  }
}

export default db;
