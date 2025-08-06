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

export function deleteImage(imageId: number) {
  // Get the image record to access file paths
  const imageRecord = db.prepare(`
    SELECT file_path, thumbnail_path FROM artwork_images WHERE id = ?
  `).get(imageId) as { file_path: string; thumbnail_path: string | null } | undefined;

  if (!imageRecord) {
    throw new Error('Image not found');
  }

  // Delete the files if they exist
  try {
    if (imageRecord.file_path && fs.existsSync(imageRecord.file_path)) {
      fs.unlinkSync(imageRecord.file_path);
    }
    if (imageRecord.thumbnail_path && fs.existsSync(imageRecord.thumbnail_path)) {
      fs.unlinkSync(imageRecord.thumbnail_path);
    }
  } catch (error) {
    console.warn('Error deleting image files:', error);
    // Continue with database deletion even if file deletion fails
  }

  // Delete the database record
  const stmt = db.prepare(`DELETE FROM artwork_images WHERE id = ?`);
  return stmt.run(imageId);
}
