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

  // If this is the first image for the artwork, set it as the preview image
  try {
    const { count } = db.prepare(`
      SELECT COUNT(*) as count FROM artwork_images WHERE artwork_id = ?
    `).get(artworkId) as { count: number };
    if (count === 1 && typeof info.lastInsertRowid === 'number') {
      db.prepare(`
        UPDATE artworks SET preview_image_id = ? WHERE id = ?
      `).run(info.lastInsertRowid, artworkId);
    }
  } catch (e) {
    // Non-fatal; continue
    console.warn('Failed to set preview image on first import:', e);
  }
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
  // Get the image record to access file paths and artwork
  const imageRecord = db.prepare(`
    SELECT id, artwork_id, file_path, thumbnail_path FROM artwork_images WHERE id = ?
  `).get(imageId) as { id: number; artwork_id: number; file_path: string; thumbnail_path: string | null } | undefined;

  if (!imageRecord) {
    throw new Error('Image not found');
  }

  // Safety: prevent deletion if it's the only image
  const { cnt } = db.prepare(`SELECT COUNT(*) as cnt FROM artwork_images WHERE artwork_id = ?`).get(imageRecord.artwork_id) as { cnt: number };
  if (cnt <= 1) {
    throw new Error("Cannot delete the only image of an artwork");
  }

  // If this image is the current preview, decide a replacement before deletion
  try {
    const art = db.prepare(`SELECT preview_image_id FROM artworks WHERE id = ?`).get(imageRecord.artwork_id) as { preview_image_id: number | null } | undefined;
    if (art && art.preview_image_id === imageRecord.id) {
      // Find another image to promote as preview (prefer the earliest by created_at)
      const replacement = db.prepare(`
        SELECT id FROM artwork_images
        WHERE artwork_id = ? AND id != ?
        ORDER BY created_at ASC
        LIMIT 1
      `).get(imageRecord.artwork_id, imageRecord.id) as { id: number } | undefined;
      const newPreview = replacement ? replacement.id : null;
      db.prepare(`UPDATE artworks SET preview_image_id = ? WHERE id = ?`).run(newPreview, imageRecord.artwork_id);
    }
  } catch (e) {
    console.warn('Failed to update preview on image deletion:', e);
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
