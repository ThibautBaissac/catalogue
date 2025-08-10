// Lazy import sharp to avoid crashing the whole app if the native module fails to load.
// This lets the rest of the application start and we can surface a clearer error later.
let _sharp: typeof import('sharp') | null = null;
async function getSharp() {
  if (_sharp) return _sharp;
  try {
    const mod = await import('sharp');
    _sharp = mod.default || (mod as any);
    return _sharp;
  } catch (e: any) {
    console.error('[images:getSharp] Failed to load sharp module. Ensure it is packaged correctly.', e?.stack || e);
    console.error('[images:getSharp] module.paths =', module.paths);
    throw new Error('Image processing module (sharp) failed to load. Try reinstalling dependencies or rebuilding the app.');
  }
}
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import db from '../db/database';
import { getArtworkOriginalsDir, getArtworkThumbsDir } from './paths';

export async function importImages(artworkId: number, filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha1').update(buffer).digest('hex');
  const destDir = getArtworkOriginalsDir(artworkId);
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
  const artworkId = db.prepare(`SELECT artwork_id FROM artwork_images WHERE id = ?`).get(id) as { artwork_id: number } | undefined;
  const thumbDir = artworkId ? getArtworkThumbsDir(artworkId.artwork_id) : path.join(path.dirname(filePath).replace('originals', 'thumbnails'));
  const thumbPath = path.join(thumbDir, path.basename(filePath, path.extname(filePath)) + '.jpg');
  const sharp = await getSharp();
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

  // Determine how many images exist (used to decide preview reassignment)
  const { cnt } = db.prepare(`SELECT COUNT(*) as cnt FROM artwork_images WHERE artwork_id = ?`).get(imageRecord.artwork_id) as { cnt: number };

  // If this image is the current preview, decide a replacement before deletion
  try {
    const art = db.prepare(`SELECT preview_image_id FROM artworks WHERE id = ?`).get(imageRecord.artwork_id) as { preview_image_id: number | null } | undefined;
    if (art && art.preview_image_id === imageRecord.id) {
      // If more than one image remains, assign a replacement; otherwise allow NULL (FK ON DELETE SET NULL also handles it)
      if (cnt > 1) {
        const replacement = db.prepare(`
          SELECT id FROM artwork_images
          WHERE artwork_id = ? AND id != ?
          ORDER BY created_at ASC
          LIMIT 1
        `).get(imageRecord.artwork_id, imageRecord.id) as { id: number } | undefined;
        const newPreview = replacement ? replacement.id : null;
        db.prepare(`UPDATE artworks SET preview_image_id = ? WHERE id = ?`).run(newPreview, imageRecord.artwork_id);
      } else {
        // Explicitly clear; (redundant with FK ON DELETE SET NULL, but keeps intent clear)
        db.prepare(`UPDATE artworks SET preview_image_id = NULL WHERE id = ?`).run(imageRecord.artwork_id);
      }
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
