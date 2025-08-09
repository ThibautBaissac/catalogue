import db from './database';

export interface PaperCreateInput {
  name: string;
  description?: string;
}

export function createPaper(input: PaperCreateInput) {
  const stmt = db.prepare(`
    INSERT INTO papers (name, description)
    VALUES (@name, @description)
  `);
  return stmt.run(input);
}

export function updatePaper(id: number, input: Partial<PaperCreateInput>) {
  const sets = Object.keys(input)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  if (!sets) throw new Error('Nothing to update');
  const sql = `UPDATE papers SET ${sets} WHERE id = @id`;
  const stmt = db.prepare(sql);
  return stmt.run({ ...input, id });
}

export function deletePaper(id: number) {
  return db.prepare(`DELETE FROM papers WHERE id = ?`).run(id);
}

export function listPapers() {
  return db.prepare(`
    SELECT p.*, COUNT(ap.artwork_id) as artwork_count
    FROM papers p
    LEFT JOIN artwork_papers ap ON ap.paper_id = p.id
    GROUP BY p.id
    ORDER BY p.name COLLATE NOCASE ASC
  `).all();
}
