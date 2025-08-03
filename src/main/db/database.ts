import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import fs from 'fs';

const userData = app.getPath('userData');
if (!fs.existsSync(userData)) {
  fs.mkdirSync(userData, { recursive: true });
}
const dbPath = join(userData, 'catalogue.db');
const db = new Database(dbPath);

// Active WAL pour meilleure sécurité et résilience
db.pragma('journal_mode = WAL');

// Initialise le schéma si nécessaire
const exists = db.prepare('SELECT name FROM sqlite_master WHERE type="table" AND name="artworks"').get();
if (!exists) {
  const schema = fs.readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
}

export default db;
