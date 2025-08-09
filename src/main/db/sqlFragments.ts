// Centralized reusable SQL snippets / fragments.
// Keep this file tiny to avoid premature abstraction bloat.

// Robust SQL expression to extract a 4-digit year from heterogeneous date strings.
// Used in multiple queries (listing artworks and aggregating years).
export const yearExtractionExpr = `CAST(COALESCE(
  NULLIF(strftime('%Y', a.date), ''),
  CASE
    WHEN a.date GLOB '*[0-9][0-9][0-9][0-9]' THEN substr(a.date, length(a.date) - 3, 4)
    WHEN instr(a.date, '19') > 0 AND substr(a.date, instr(a.date, '19'), 4) GLOB '[0-9][0-9][0-9][0-9]' THEN substr(a.date, instr(a.date, '19'), 4)
    WHEN instr(a.date, '20') > 0 AND substr(a.date, instr(a.date, '20'), 4) GLOB '[0-9][0-9][0-9][0-9]' THEN substr(a.date, instr(a.date, '20'), 4)
  END
) AS INTEGER)`;
