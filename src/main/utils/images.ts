import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import db from '../db/database';

export async function importImages(artworkId: number, filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha1').update(buffer).digest('hex');
  const userData = path.join(require('electron').app.getPath('userData'));
  const destDir = path.join(userData, 'catalogue', 'images', String(artworkId), 'originals');
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, path.basename(filePath));
  fs.copyFileSync(filePath, destPath);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO artwork_images(artwork_id, file_path, hash)
    VALUES(?,?,?)
  `);
  const info = stmt.run(artworkId, destPath, hash);
  return { id: info.lastInsertRowid, filePath: destPath, hash };
}

export async function generateThumbnails({ id, filePath }: { id: number; filePath: string; hash: string; }) {
  const thumbDir = path.join(path.dirname(filePath).replace('originals', 'thumbnails'));
  fs.mkdirSync(thumbDir, { recursive: true });
  const thumbPath = path.join(thumbDir, path.basename(filePath, path.extname(filePath)) + '.jpg');
  await sharp(filePath)
    .resize({ width: 300 })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);
  const stmt = db.prepare(`
    UPDATE artwork_images SET thumbnail_path = ? WHERE id = ?
  `);
  stmt.run(thumbPath, id);
}
