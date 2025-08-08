PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS pigments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  date DATE
);

CREATE TABLE IF NOT EXISTS types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  owner TEXT,
  width REAL,
  height REAL,
  date DATE,
  collection_id INTEGER,
  type_id INTEGER,
  place_id INTEGER,
  FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE SET NULL,
  FOREIGN KEY(type_id) REFERENCES types(id) ON DELETE SET NULL,
  FOREIGN KEY(place_id) REFERENCES places(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS artwork_papers (
  artwork_id INTEGER,
  paper_id INTEGER,
  PRIMARY KEY(artwork_id, paper_id),
  FOREIGN KEY(artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY(paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artwork_pigments (
  artwork_id INTEGER,
  pigment_id INTEGER,
  PRIMARY KEY(artwork_id, pigment_id),
  FOREIGN KEY(artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY(pigment_id) REFERENCES pigments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artwork_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_artworks_reference ON artworks(reference);
CREATE INDEX IF NOT EXISTS idx_artworks_title ON artworks(title);
CREATE INDEX IF NOT EXISTS idx_artworks_type ON artworks(type_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(date);
CREATE INDEX IF NOT EXISTS idx_artwork_papers_artwork ON artwork_papers(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_papers_paper ON artwork_papers(paper_id);
CREATE INDEX IF NOT EXISTS idx_artwork_pigments_artwork ON artwork_pigments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_pigments_pigment ON artwork_pigments(pigment_id);

CREATE VIRTUAL TABLE IF NOT EXISTS artworks_fts USING fts5(
  title, description, reference, content='artworks', content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS artworks_ai AFTER INSERT ON artworks BEGIN
  INSERT INTO artworks_fts(rowid, title, description, reference)
  VALUES (new.id, new.title, new.description, new.reference);
END;

CREATE TRIGGER IF NOT EXISTS artworks_ad AFTER DELETE ON artworks BEGIN
  INSERT INTO artworks_fts(artworks_fts, rowid, title, description, reference)
  VALUES('delete', old.id, old.title, old.description, old.reference);
END;

CREATE TRIGGER IF NOT EXISTS artworks_au AFTER UPDATE ON artworks BEGIN
  INSERT INTO artworks_fts(artworks_fts, rowid, title, description, reference)
  VALUES('delete', old.id, old.title, old.description, old.reference);
  INSERT INTO artworks_fts(rowid, title, description, reference)
  VALUES (new.id, new.title, new.description, new.reference);
END;
