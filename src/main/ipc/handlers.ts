import { ipcMain, app, dialog, BrowserWindow } from 'electron';
import { registerIpc } from './register';
import {
  createArtwork,
  updateArtwork,
  deleteArtwork,
  listArtworks,
  getArtworkFull,
  setPigmentsForArtwork,
  setPapersForArtwork,
  listArtworkYears,
  setPreviewImage,
} from '../db/artworkRepository';
import {
  createCollection,
  updateCollection,
  deleteCollection,
  listCollections,
} from '../db/collectionRepository';
import { createPigment, listPigments, updatePigment, deletePigment } from '../db/pigmentRepository';
import { createPaper, listPapers, updatePaper, deletePaper } from '../db/paperRepository';
import { createType, listTypes, updateType, deleteType } from '../db/typeRepository';
import { createPlace, listPlaces, updatePlace, deletePlace } from '../db/placeRepository';
import { importImages, generateThumbnails, deleteImage } from '../utils/images';
import { backup, restore } from '../utils/backup';

registerIpc('artwork.create', (input: any) => {
  if (!input.reference) throw new Error('Référence obligatoire');
  const result = createArtwork(input);
  return { id: result.lastInsertRowid };
});

registerIpc('artwork.update', ({ id, updates }: any) => { updateArtwork(id, updates); });

registerIpc('artwork.delete', ({ id }: any) => { deleteArtwork(id); });

registerIpc('artwork.list', (filters: any) => {
  const rowsOrObj = listArtworks(filters);
  if (Array.isArray(rowsOrObj)) return rowsOrObj;
  return { items: rowsOrObj.items, total: rowsOrObj.total, hasMore: rowsOrObj.total !== undefined && rowsOrObj.items.length + (filters.offset || 0) < rowsOrObj.total };
});

registerIpc('artwork.getFull', ({ id }: any) => {
  const full = getArtworkFull(id);
  if (!full) throw new Error('Œuvre introuvable');
  return full;
});

registerIpc('artwork.listYears', () => listArtworkYears());

registerIpc('collection.create', (input: any) => {
  if (!input.name) throw new Error('Nom requis');
  const r = createCollection(input);
  return { id: r.lastInsertRowid };
});

registerIpc('collection.list', () => listCollections());

registerIpc('collection.update', ({ id, updates }: any) => { updateCollection(id, updates); });

registerIpc('collection.delete', ({ id }: any) => { deleteCollection(id); });

registerIpc('pigment.list', () => listPigments());
registerIpc('pigment.create', (input: any) => ({ id: createPigment(input).lastInsertRowid }));
registerIpc('pigment.update', ({ id, updates }: any) => { updatePigment(id, updates); });
registerIpc('pigment.delete', ({ id }: any) => { deletePigment(id); });

registerIpc('paper.list', () => listPapers());
registerIpc('paper.create', (input: any) => ({ id: createPaper(input).lastInsertRowid }));
registerIpc('paper.update', ({ id, updates }: any) => { updatePaper(id, updates); });
registerIpc('paper.delete', ({ id }: any) => { deletePaper(id); });

registerIpc('type.list', () => listTypes());
registerIpc('type.create', (input: any) => ({ id: createType(input).lastInsertRowid }));
registerIpc('type.update', ({ id, updates }: any) => { updateType(id, updates); });
registerIpc('type.delete', ({ id }: any) => { deleteType(id); });

registerIpc('place.list', () => listPlaces());
registerIpc('place.create', (input: any) => ({ id: createPlace(input).lastInsertRowid }));
registerIpc('place.update', ({ id, updates }: any) => { updatePlace(id, updates); });
registerIpc('place.delete', ({ id }: any) => { deletePlace(id); });

registerIpc('artwork.addImage', async ({ artworkId, filePaths }: any) => {
  for (const fp of filePaths) {
    const img = await importImages(artworkId, fp);
    await generateThumbnails(img as any);
  }
});

registerIpc('artwork.removeImage', ({ imageId }: any) => { deleteImage(imageId); });

registerIpc('artwork.setPigments', ({ artworkId, pigmentIds }: any) => { setPigmentsForArtwork(artworkId, pigmentIds); });

registerIpc('artwork.setPapers', ({ artworkId, paperIds }: any) => { setPapersForArtwork(artworkId, paperIds); });

registerIpc('artwork.setPreviewImage', ({ artworkId, imageId }: any) => { setPreviewImage(artworkId, imageId); });

registerIpc('catalog.backup', async ({ destinationPath }: any) => {
  const win = BrowserWindow.getFocusedWindow();
  await backup(destinationPath, (p) => {
    win?.webContents.send('catalog.backupProgress', p);
  });
});

registerIpc('catalog.restore', async ({ sourceZip }: any) => { await restore(sourceZip); });

// System helpers
registerIpc('system.desktopPath', () => app.getPath('desktop'));
registerIpc('system.showSaveDialog', async (opts: { defaultPath?: string } | undefined) => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await (win ? dialog.showSaveDialog(win, {
    title: 'Choisir le fichier de sauvegarde',
    buttonLabel: 'Sauvegarder',
    defaultPath: opts?.defaultPath,
    filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
  }) : dialog.showSaveDialog({
    title: 'Choisir le fichier de sauvegarde',
    buttonLabel: 'Sauvegarder',
    defaultPath: opts?.defaultPath,
    filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
  }));
  if (result.canceled) return null;
  return result.filePath || null;
});
