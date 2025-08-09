import db from './database';

export interface TypeCreateInput {
  name: string;
  description?: string;
  date?: string;
}

export function createType(input: TypeCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO types (name, description)
    VALUES (@name, @description)
  `);
  return stmt.run(input);
}

export function updateType(id: number, input: Partial<TypeCreateInput>) {
  const sets = Object.keys(input)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  if (!sets) throw new Error('Nothing to update');
  const sql = `UPDATE types SET ${sets} WHERE id = @id`;
  const stmt = db.prepare(sql);
  return stmt.run({ ...input, id });
}

export function deleteType(id: number) {
  return db.prepare(`DELETE FROM types WHERE id = ?`).run(id);
}

export function listTypes() {
  return db.prepare(`
    SELECT t.*, COUNT(a.id) as artwork_count
    FROM types t
    LEFT JOIN artworks a ON a.type_id = t.id
    GROUP BY t.id
    ORDER BY t.name COLLATE NOCASE ASC
  `).all();
}
