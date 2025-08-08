import { app } from 'electron';
import { join } from 'path';
import fs from 'fs';

export function getStorageRoot() {
  const base = app.getPath('appData');
  const root = join(base, 'catalogue');
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  return root;
}

export function getDatabasePath() {
  return join(getStorageRoot(), 'catalogue.db');
}

export function getArtworkImagesDir(artworkId: number) {
  return join(getStorageRoot(), 'images', String(artworkId));
}

export function getArtworkOriginalsDir(artworkId: number) {
  const d = join(getArtworkImagesDir(artworkId), 'originals');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

export function getArtworkThumbsDir(artworkId: number) {
  const d = join(getArtworkImagesDir(artworkId), 'thumbnails');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}
