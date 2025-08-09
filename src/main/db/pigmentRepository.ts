import db from './database';

export interface PigmentCreateInput {
  name: string;
  description?: string;
}

export function createPigment(input: PigmentCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO pigments (name, description)
    VALUES (@name, @description)
  `);
  return stmt.run(input);
}

export function updatePigment(id: number, input: Partial<PigmentCreateInput>) {
  const sets = Object.keys(input)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  if (!sets) throw new Error('Nothing to update');
  const sql = `UPDATE pigments SET ${sets} WHERE id = @id`;
  const stmt = db.prepare(sql);
  return stmt.run({ ...input, id });
}

export function deletePigment(id: number) {
  return db.prepare(`DELETE FROM pigments WHERE id = ?`).run(id);
}

export function listPigments() {
  return db.prepare(`
    SELECT p.*, COUNT(ap.artwork_id) as artwork_count
    FROM pigments p
    LEFT JOIN artwork_pigments ap ON ap.pigment_id = p.id
    GROUP BY p.id
    ORDER BY p.name COLLATE NOCASE ASC
  `).all();
}
