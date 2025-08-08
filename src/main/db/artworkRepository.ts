import db from './database';

export interface ArtworkCreateInput {
  reference: string;
  title?: string;
  description?: string;
  owner?: string | null;
  width?: number;
  height?: number;
  date?: string;
  collection_id?: number | null;
  type_id?: number | null;
  place_id?: number | null;
}

export function createArtwork(input: ArtworkCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO artworks (reference, title, description, owner, width, height, date, collection_id, type_id, place_id)
    VALUES (@reference, @title, @description, @owner, @width, @height, @date, @collection_id, @type_id, @place_id)
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
  years?: number[];
  noCollection?: boolean;
  noType?: boolean;
  noPlace?: boolean;
  noPigments?: boolean;
  noPapers?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const conditions: string[] = [];
  const params: any[] = [];
  let base = `SELECT DISTINCT a.* FROM artworks a`;

  // Robust SQL expression to extract a 4-digit year from various date formats
  // Supports: ISO dates (YYYY-MM-DD), bracketed years like [2007], and strings like 10.1995
  const yearExpr = `CAST(COALESCE(
      NULLIF(strftime('%Y', a.date), ''),
      CASE 
        WHEN a.date GLOB '*[0-9][0-9][0-9][0-9]' THEN substr(a.date, length(a.date) - 3, 4)
        WHEN instr(a.date, '19') > 0 AND substr(a.date, instr(a.date, '19'), 4) GLOB '[0-9][0-9][0-9][0-9]' THEN substr(a.date, instr(a.date, '19'), 4)
        WHEN instr(a.date, '20') > 0 AND substr(a.date, instr(a.date, '20'), 4) GLOB '[0-9][0-9][0-9][0-9]' THEN substr(a.date, instr(a.date, '20'), 4)
      END
    ) AS INTEGER)`;

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

  // Handle "no" filters
  if (filters.noCollection) {
    conditions.push(`a.collection_id IS NULL`);
  }

  if (filters.noType) {
    conditions.push(`a.type_id IS NULL`);
  }

  if (filters.noPlace) {
    conditions.push(`a.place_id IS NULL`);
  }

  if (filters.noPigments) {
    conditions.push(`a.id NOT IN (SELECT DISTINCT artwork_id FROM artwork_pigments)`);
  }

  if (filters.noPapers) {
    conditions.push(`a.id NOT IN (SELECT DISTINCT artwork_id FROM artwork_papers)`);
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

  if (filters.years && filters.years.length) {
    // Match artworks whose extracted year is in the selected list (ignore invalid years outside 1000-2100)
    conditions.push(
      `${yearExpr} BETWEEN 1000 AND 2100 AND ${yearExpr} IN (${filters.years.map(() => '?').join(',')})`
    );
    params.push(...filters.years);
  }

  let sql = base;
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY CAST(a.reference AS INTEGER) DESC NULLS LAST, a.title COLLATE NOCASE';

  if (filters.limit) {
    sql += ' LIMIT ' + filters.limit;
    if (filters.offset) sql += ' OFFSET ' + filters.offset;
  }

  const artworks = db.prepare(sql).all(...params) as any[];

  // For each artwork, get the first image
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

export function listArtworkYears(): { year: number; count: number }[] {
  // Use the same robust year extraction logic as in listArtworks
  const sql = `
    WITH yrs AS (
      SELECT CAST(COALESCE(
        NULLIF(strftime('%Y', date), ''),
        CASE 
          WHEN date GLOB '*[0-9][0-9][0-9][0-9]' THEN substr(date, length(date) - 3, 4)
          WHEN instr(date, '19') > 0 AND substr(date, instr(date, '19'), 4) GLOB '[0-9][0-9][0-9][0-9]' THEN substr(date, instr(date, '19'), 4)
          WHEN instr(date, '20') > 0 AND substr(date, instr(date, '20'), 4) GLOB '[0-9][0-9][0-9][0-9]' THEN substr(date, instr(date, '20'), 4)
        END
      ) AS INTEGER) AS year
      FROM artworks
      WHERE date IS NOT NULL AND TRIM(date) != ''
    )
    SELECT year, COUNT(*) as count
    FROM yrs
    WHERE year BETWEEN 1000 AND 2100
    GROUP BY year
    ORDER BY year DESC
  `;
  const rows = db.prepare(sql).all() as { year: number; count: number }[];
  return rows;
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
