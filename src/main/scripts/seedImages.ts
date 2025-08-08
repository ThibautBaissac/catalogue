import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import db from '../db/database';
import { importImages, generateThumbnails } from '../utils/images';

// Simple CLI args parser: supports --dir=/path or positional path
function getTargetDir(): string {
  const argDirFlag = process.argv.find((a) => a.startsWith('--dir='));
  const flagVal = argDirFlag ? argDirFlag.split('=')[1] : undefined;
  const positional = process.argv[2];
  // Default to user's provided folder if nothing else
  return flagVal || positional || '/Users/thibautbaissac/Desktop/2024';
}

function* walkSync(dir: string): Generator<string> {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop()!;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (e) {
      console.warn(`Cannot read directory: ${current}`, e);
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // skip hidden
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) yield full;
    }
  }
}

function parseReferenceFromFilename(filePath: string): string | null {
  const base = path.basename(filePath);
  // Examples: PT2810_30x30_24.02.2024.jpg -> 2810
  const m = base.match(/PT\s*([0-9]+)/i);
  if (!m) return null;
  return m[1];
}

function getArtworkIdByReference(refStr: string): number | null {
  // Try exact match first
  let rows = db
    .prepare(
      `SELECT id FROM artworks WHERE reference = ? ORDER BY id DESC`
    )
    .all(refStr) as { id: number }[];
  if (rows.length === 1) return rows[0].id;
  if (rows.length > 1) {
    console.warn(`Ambiguous reference (exact) '${refStr}' -> ${rows.length} artworks. Skipping.`);
    return null;
  }

  // Try numeric cast match if reference is numeric
  const refNum = parseInt(refStr, 10);
  if (!Number.isFinite(refNum)) return null;
  rows = db
    .prepare(
      `SELECT id FROM artworks WHERE CAST(reference AS INTEGER) = ? ORDER BY id DESC`
    )
    .all(refNum) as { id: number }[];
  if (rows.length === 1) return rows[0].id;
  if (rows.length > 1) {
    console.warn(`Ambiguous reference (numeric) '${refStr}' -> ${rows.length} artworks. Skipping.`);
    return null;
  }
  return null;
}

function sha1OfFile(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(buf).digest('hex');
}

async function run() {
  const targetDir = getTargetDir();
  console.log(`Seeding images from: ${targetDir}`);
  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    app.exit(1);
    return;
  }

  const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif']);
  let total = 0;
  let linked = 0;
  let skippedNoRef = 0;
  let skippedNoArtwork = 0;
  let skippedDuplicate = 0;

  for (const file of walkSync(targetDir)) {
    const ext = path.extname(file).toLowerCase();
    if (!exts.has(ext)) continue;
    total++;

    const ref = parseReferenceFromFilename(file);
    if (!ref) {
      skippedNoRef++;
      console.warn(`No PT reference in filename: ${file}`);
      continue;
    }

    const artworkId = getArtworkIdByReference(ref);
    if (!artworkId) {
      skippedNoArtwork++;
      console.warn(`No unique artwork found for reference ${ref} (file: ${path.basename(file)})`);
      continue;
    }

    // Deduplicate by file hash per artwork
    const hash = sha1OfFile(file);
    const existing = db
      .prepare(`SELECT id FROM artwork_images WHERE artwork_id = ? AND hash = ?`)
      .get(artworkId, hash) as { id: number } | undefined;
    if (existing) {
      skippedDuplicate++;
      continue;
    }

    try {
      const info = await importImages(artworkId, file);
      const imageId = Number(info.id);
      if (Number.isFinite(imageId)) {
        await generateThumbnails({ id: imageId, filePath: info.filePath, hash: info.hash });
      }
      linked++;
      if (linked % 25 === 0) console.log(`Linked ${linked} images so far...`);
    } catch (e) {
      console.error(`Failed to import ${file}:`, e);
    }
  }

  console.log('--- Seeding complete ---');
  console.log(
    JSON.stringify(
      { total, linked, skippedNoRef, skippedNoArtwork, skippedDuplicate },
      null,
      2
    )
  );
  app.exit(0);
}

app
  .whenReady()
  .then(run)
  .catch((e) => {
    console.error('Seed run failed:', e);
    app.exit(1);
  });
