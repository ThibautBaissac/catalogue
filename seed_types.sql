-- Clear existing types
DELETE FROM types;

-- Batch import of types
INSERT OR IGNORE INTO types (name) VALUES
('Aquarelle'),
('Dessin'),
('Étude'),
('Huile'),
("Livre d'artiste"),
('Pastel sec'),
('Tempera'),
('Tempera sur toile');
