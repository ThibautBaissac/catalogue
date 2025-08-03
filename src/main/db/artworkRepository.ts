import db from './database';

export interface ArtworkCreateInput {
  reference: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  date?: string;
  collection_id?: number | null;
}

export function createArtwork(input: ArtworkCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO artworks (reference, title, description, width, height, date, collection_id)
    VALUES (@reference, @title, @description, @width, @height, @date, @collection_id)
  `);
  return stmt.run(input);
}

export function updateArtwork(id: number, input: Partial<ArtworkCreateInput>) {
  const sets = Object.keys(input)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  if (!sets) throw new Error('Rien à mettre à jour');
  const sql = `UPDATE artworks SET ${sets} WHERE id = @id`;
  const stmt = db.prepare(sql);
  return stmt.run({ ...input, id });
}

export function deleteArtwork(id: number) {
  return db.prepare(`DELETE FROM artworks WHERE id = ?`).run(id);
}

export function getArtworkById(id: number) {
  return db.prepare(`SELECT * FROM artworks WHERE id = ?`).get(id);
}

export function listArtworks(filters: {
  query?: string;
  pigments?: number[];
  papers?: number[];
  collectionId?: number;
  dateRange?: { from?: string; to?: string };
  limit?: number;
  offset?: number;
} = {}) {
  const conditions: string[] = [];
  const params: any[] = [];
  let base = `SELECT DISTINCT a.* FROM artworks a`;

  if (filters.query) {
    base += ` JOIN artworks_fts f ON f.rowid = a.id`;
    conditions.push(`f MATCH ?`);
    params.push(filters.query + '*');
  }

  if (filters.pigments && filters.pigments.length) {
    base += ` JOIN artwork_pigments ap ON ap.artwork_id = a.id`;
    conditions.push(`ap.pigment_id IN (${filters.pigments.map(() => '?').join(',')})`);
    params.push(...filters.pigments);
  }

  if (filters.papers && filters.papers.length) {
    base += ` JOIN artwork_papers ap2 ON ap2.artwork_id = a.id`;
    conditions.push(`ap2.paper_id IN (${filters.papers.map(() => '?').join(',')})`);
    params.push(...filters.papers);
  }

  if (filters.collectionId) {
    conditions.push(`a.collection_id = ?`);
    params.push(filters.collectionId);
  }

  if (filters.dateRange) {
    if (filters.dateRange.from) {
      conditions.push(`date(a.date) >= date(?)`);
      params.push(filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      conditions.push(`date(a.date) <= date(?)`);
      params.push(filters.dateRange.to);
    }
  }

  let sql = base;
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY a.date DESC NULLS LAST, a.title COLLATE NOCASE';

  if (filters.limit) {
    sql += ' LIMIT ' + filters.limit;
    if (filters.offset) sql += ' OFFSET ' + filters.offset;
  }

  return db.prepare(sql).all(...params);
}

export function getArtworkFull(id: number) {
  const artwork = getArtworkById(id) as any;
  if (!artwork) return null;
  const pigments = db.prepare(`
    SELECT p.* FROM pigments p
    JOIN artwork_pigments ap ON ap.pigment_id = p.id
    WHERE ap.artwork_id = ?
  `).all(id);
  const papers = db.prepare(`
    SELECT p.* FROM papers p
    JOIN artwork_papers ap ON ap.paper_id = p.id
    WHERE ap.artwork_id = ?
  `).all(id);
  const images = db.prepare(`SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY created_at DESC`).all(id);
  const collection = artwork.collection_id
    ? db.prepare(`SELECT * FROM collections WHERE id = ?`).get(artwork.collection_id)
    : null;
  return { artwork, pigments, papers, images, collection };
}
