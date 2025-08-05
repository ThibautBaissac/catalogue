import { ipcMain } from 'electron';
import {
  createArtwork,
  updateArtwork,
  deleteArtwork,
  listArtworks,
  getArtworkFull,
  setPigmentsForArtwork,
  setPapersForArtwork,
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
import { importImages, generateThumbnails } from '../utils/images';
import { backup, restore } from '../utils/backup';

function ok(data: any = null) {
  return { success: true, data };
}
function fail(message: string) {
  return { success: false, error: message };
}

ipcMain.handle('artwork.create', (event, input) => {
  try {
    if (!input.reference) return fail('Référence obligatoire');
    const result = createArtwork(input);
    return ok({ id: result.lastInsertRowid });
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('artwork.update', (event, { id, updates }) => {
  try {
    updateArtwork(id, updates);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('artwork.delete', (event, { id }) => {
  try {
    deleteArtwork(id);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('artwork.list', (event, filters) => {
  try {
    const rows = listArtworks(filters);
    return ok(rows);
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('artwork.getFull', (event, { id }) => {
  try {
    const full = getArtworkFull(id);
    if (!full) return fail('Œuvre introuvable');
    return ok(full);
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('collection.create', (_, input) => {
  try {
    if (!input.name) return fail('Nom requis');
    const r = createCollection(input);
    return ok({ id: r.lastInsertRowid });
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('collection.list', () => {
  try {
    const all = listCollections();
    return ok(all);
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('collection.update', (_, { id, updates }) => {
  try {
    updateCollection(id, updates);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('collection.delete', (_, { id }) => {
  try {
    deleteCollection(id);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('pigment.list', () => {
  try { return ok(listPigments()); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('pigment.create', (_, input) => {
  try { return ok({ id: createPigment(input).lastInsertRowid }); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('pigment.update', (_, { id, updates }) => {
  try { updatePigment(id, updates); return ok(); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('pigment.delete', (_, { id }) => {
  try { deletePigment(id); return ok(); } catch (e: any) { return fail(e.message); }
});

ipcMain.handle('paper.list', () => {
  try { return ok(listPapers()); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('paper.create', (_, input) => {
  try { return ok({ id: createPaper(input).lastInsertRowid }); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('paper.update', (_, { id, updates }) => {
  try { updatePaper(id, updates); return ok(); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('paper.delete', (_, { id }) => {
  try { deletePaper(id); return ok(); } catch (e: any) { return fail(e.message); }
});

ipcMain.handle('type.list', () => {
  try { return ok(listTypes()); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('type.create', (_, input) => {
  try { return ok({ id: createType(input).lastInsertRowid }); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('type.update', (_, { id, updates }) => {
  try { updateType(id, updates); return ok(); } catch (e: any) { return fail(e.message); }
});
ipcMain.handle('type.delete', (_, { id }) => {
  try { deleteType(id); return ok(); } catch (e: any) { return fail(e.message); }
});


ipcMain.handle('artwork.addImage', async (_, { artworkId, filePaths }) => {
  try {
    for (const fp of filePaths) {
      const img = await importImages(artworkId, fp);
      await generateThumbnails(img as any);
    }
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('artwork.setPigments', (_, { artworkId, pigmentIds }) => {
  try {
    setPigmentsForArtwork(artworkId, pigmentIds);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('artwork.setPapers', (_, { artworkId, paperIds }) => {
  try {
    setPapersForArtwork(artworkId, paperIds);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('catalog.backup', async (_, { destinationPath }) => {
  try {
    await backup(destinationPath);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});

ipcMain.handle('catalog.restore', async (_, { sourceZip }) => {
  try {
    await restore(sourceZip);
    return ok();
  } catch (e: any) {
    return fail(e.message);
  }
});
