import db from './database';

/**
 * Attach a primaryImage (preview image or fallback first) to each artwork row.
 * Kept separate for reuse and testability. Returns new objects.
 */
export function addPrimaryImages<T extends { id: number; preview_image_id?: number | null }>(artworks: T[]) {
  return artworks.map(artwork => {
    let primaryImage: any | null = null;

    if (artwork.preview_image_id) {
      primaryImage = db.prepare(`
        SELECT * FROM artwork_images WHERE id = ? AND artwork_id = ?
      `).get(artwork.preview_image_id, artwork.id);
    }
    if (!primaryImage) {
      primaryImage = db.prepare(`
        SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY created_at ASC LIMIT 1
      `).get(artwork.id) || null;
    }

    return { ...artwork, primaryImage };
  });
}
