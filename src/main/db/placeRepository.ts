import db from './database';

export interface PlaceCreateInput {
  name: string;
}

export function createPlace(input: PlaceCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO places (name)
    VALUES (@name)
  `);
  return stmt.run(input);
}

export function updatePlace(id: number, input: Partial<PlaceCreateInput>) {
  const sets = Object.keys(input)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  if (!sets) throw new Error('Nothing to update');
  const sql = `UPDATE places SET ${sets} WHERE id = @id`;
  const stmt = db.prepare(sql);
  return stmt.run({ ...input, id });
}

export function deletePlace(id: number) {
  return db.prepare(`DELETE FROM places WHERE id = ?`).run(id);
}

export function listPlaces() {
  return db.prepare(`
    SELECT p.*, COUNT(a.id) as artwork_count
    FROM places p
    LEFT JOIN artworks a ON a.place_id = p.id
    GROUP BY p.id
    ORDER BY p.name COLLATE NOCASE ASC
  `).all();
}
