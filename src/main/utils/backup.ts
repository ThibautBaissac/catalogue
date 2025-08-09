import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import unzipper from 'unzipper';

const userData = app.getPath('userData');
const dbFile = path.join(userData, 'catalogue.db');
const imagesDir = path.join(userData, 'catalogue', 'images');

interface BackupProgressInfo {
  processedBytes: number;
  totalBytes?: number;
  processedFiles: number;
  totalFiles?: number;
  percent?: number; // 0-100
}

function computeDirSize(dir: string): { bytes: number; files: number } {
  let bytes = 0; let files = 0;
  if (!fs.existsSync(dir)) return { bytes, files };
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const sub = computeDirSize(full);
      bytes += sub.bytes; files += sub.files;
    } else {
      bytes += stat.size; files += 1;
    }
  }
  return { bytes, files };
}
export function backup(destinationZip: string, onProgress?: (p: BackupProgressInfo) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destinationZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Pre-compute totals for percent
    let totalBytes = 0; let totalFiles = 1; // start with db file
    try {
      if (fs.existsSync(dbFile)) totalBytes += fs.statSync(dbFile).size;
      if (fs.existsSync(imagesDir)) {
        const { bytes, files } = computeDirSize(imagesDir);
        totalBytes += bytes; totalFiles += files;
      }
    } catch { /* ignore */ }

    output.on('close', () => {
      onProgress?.({ processedBytes: totalBytes, totalBytes, processedFiles: totalFiles, totalFiles, percent: 100 });
      resolve();
    });
    archive.on('error', (err) => reject(err));

    if (onProgress) {
      archive.on('progress', (prog) => {
        const processedBytes = prog.fs.processedBytes;
        const processedFiles = prog.entries.processed;
        const percent = totalBytes ? Math.min(100, Math.round((processedBytes / totalBytes) * 100)) : undefined;
        onProgress({ processedBytes, totalBytes, processedFiles, totalFiles, percent });
      });
    }

    archive.pipe(output);
    if (fs.existsSync(dbFile)) archive.file(dbFile, { name: 'catalogue.db' });
    if (fs.existsSync(imagesDir)) archive.directory(imagesDir, 'images');
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
