import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import unzipper from 'unzipper';

const userData = app.getPath('userData');
const dbFile = path.join(userData, 'catalogue.db');
const imagesDir = path.join(userData, 'catalogue', 'images');

export function backup(destinationZip: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destinationZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.file(dbFile, { name: 'catalogue.db' });
    if (fs.existsSync(imagesDir)) {
      archive.directory(imagesDir, 'images');
    }
    archive.finalize();
  });
}

export function restore(sourceZip: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(sourceZip)
      .pipe(unzipper.Extract({ path: userData }))
      .on('close', () => resolve())
  .on('error', (e: unknown) => reject(e as any));
  });
}
