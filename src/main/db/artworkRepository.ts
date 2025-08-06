import db from './database';

export interface ArtworkCreateInput {
  reference: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  date?: string;
  collection_id?: number | null;
  type_id?: number | null;
}

export function createArtwork(input: ArtworkCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO artworks (reference, title, description, width, height, date, collection_id, type_id)
    VALUES (@reference, @title, @description, @width, @height, @date, @collection_id, @type_id)
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

// Association management functions
export function addPigmentToArtwork(artworkId: number, pigmentId: number) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO artwork_pigments (artwork_id, pigment_id)
    VALUES (?, ?)
  `);
  return stmt.run(artworkId, pigmentId);
}

export function removePigmentFromArtwork(artworkId: number, pigmentId: number) {
  const stmt = db.prepare(`
    DELETE FROM artwork_pigments
    WHERE artwork_id = ? AND pigment_id = ?
  `);
  return stmt.run(artworkId, pigmentId);
}

export function setPigmentsForArtwork(artworkId: number, pigmentIds: number[]) {
  const transaction = db.transaction(() => {
    // Remove all existing pigments
    db.prepare(`DELETE FROM artwork_pigments WHERE artwork_id = ?`).run(artworkId);

    // Add new pigments
    const insertStmt = db.prepare(`
      INSERT INTO artwork_pigments (artwork_id, pigment_id)
      VALUES (?, ?)
    `);

    for (const pigmentId of pigmentIds) {
      insertStmt.run(artworkId, pigmentId);
    }
  });

  transaction();
}

export function addPaperToArtwork(artworkId: number, paperId: number) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO artwork_papers (artwork_id, paper_id)
    VALUES (?, ?)
  `);
  return stmt.run(artworkId, paperId);
}

export function removePaperFromArtwork(artworkId: number, paperId: number) {
  const stmt = db.prepare(`
    DELETE FROM artwork_papers
    WHERE artwork_id = ? AND paper_id = ?
  `);
  return stmt.run(artworkId, paperId);
}

export function setPapersForArtwork(artworkId: number, paperIds: number[]) {
  const transaction = db.transaction(() => {
    // Remove all existing papers
    db.prepare(`DELETE FROM artwork_papers WHERE artwork_id = ?`).run(artworkId);

    // Add new papers
    const insertStmt = db.prepare(`
      INSERT INTO artwork_papers (artwork_id, paper_id)
      VALUES (?, ?)
    `);

    for (const paperId of paperIds) {
      insertStmt.run(artworkId, paperId);
    }
  });

  transaction();
}

export function listArtworks(filters: {
  query?: string;
  pigments?: number[];
  papers?: number[];
  collectionId?: number;
  typeId?: number;
  placeId?: number;
  dateRange?: { from?: string; to?: string };
  limit?: number;
  offset?: number;
} = {}) {
  const conditions: string[] = [];
  const params: any[] = [];
  let base = `SELECT DISTINCT a.* FROM artworks a`;

  if (filters.query) {
    base += ` JOIN artworks_fts fts ON fts.rowid = a.id`;
    conditions.push(`artworks_fts MATCH ?`);
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

  if (filters.typeId) {
    conditions.push(`a.type_id = ?`);
    params.push(filters.typeId);
  }

  if (filters.placeId) {
    conditions.push(`a.place_id = ?`);
    params.push(filters.placeId);
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

  const artworks = db.prepare(sql).all(...params) as any[];

  // For each artwork, get the first/primary image
  const artworksWithImages = artworks.map(artwork => {
    const primaryImage = db.prepare(`
      SELECT * FROM artwork_images
      WHERE artwork_id = ?
      ORDER BY created_at ASC
      LIMIT 1
    `).get(artwork.id);

    return {
      ...artwork,
      primaryImage: primaryImage || null
    };
  });

  return artworksWithImages;
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
  const type = artwork.type_id
    ? db.prepare(`SELECT * FROM types WHERE id = ?`).get(artwork.type_id)
    : null;
  const place = artwork.place_id
    ? db.prepare(`SELECT * FROM places WHERE id = ?`).get(artwork.place_id)
    : null;
  return { artwork, pigments, papers, images, collection, type, place };
}
