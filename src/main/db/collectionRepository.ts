import db from './database';

export interface CollectionCreateInput {
  name: string;
  description?: string;
  date?: string;
}

export function createCollection(input: CollectionCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO collections (name, description, date)
    VALUES (@name, @description, @date)
  `);
  return stmt.run(input);
}

export function updateCollection(id: number, input: Partial<CollectionCreateInput>) {
  const sets = Object.keys(input)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  if (!sets) throw new Error('Nothing to update');
  const sql = `UPDATE collections SET ${sets} WHERE id = @id`;
  const stmt = db.prepare(sql);
  return stmt.run({ ...input, id });
}

export function deleteCollection(id: number) {
  return db.prepare(`DELETE FROM collections WHERE id = ?`).run(id);
}

export function listCollections() {
  return db.prepare(`SELECT * FROM collections ORDER BY date DESC`).all();
}
