-- Clear existing places
DELETE FROM places;

-- Batch import of places
INSERT OR IGNORE INTO places (name) VALUES
('Atelier du Chapitre'),
('Atelier de la Fontaine'),
('Atelier de la Bouquerie');
