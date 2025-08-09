import { contextBridge, ipcRenderer } from 'electron';

function wrap(channel: string) {
  return (...args: any[]) => ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld('api', {
  createArtwork: (data: any) => wrap('artwork.create')(data),
  updateArtwork: (params: { id: number; updates: any }) => wrap('artwork.update')(params),
  deleteArtwork: (id: number) => wrap('artwork.delete')({ id }),
  listArtworks: (filters: any) => wrap('artwork.list')(filters),
  getArtworkFull: (id: number) => wrap('artwork.getFull')({ id }),
  listYears: wrap('artwork.listYears'),
  setPigments: (params: { artworkId: number; pigmentIds: number[] }) => wrap('artwork.setPigments')(params),
  setPapers: (params: { artworkId: number; paperIds: number[] }) => wrap('artwork.setPapers')(params),

  listCollections: wrap('collection.list'),
  createCollection: (data: any) => wrap('collection.create')(data),
  updateCollection: (params: any) => wrap('collection.update')(params),
  deleteCollection: (id: number) => wrap('collection.delete')({ id }),

  listPigments: wrap('pigment.list'),
  createPigment: (data: any) => wrap('pigment.create')(data),
  updatePigment: (params: any) => wrap('pigment.update')(params),
  deletePigment: (id: number) => wrap('pigment.delete')({ id }),

  listPapers: wrap('paper.list'),
  createPaper: (data: any) => wrap('paper.create')(data),
  updatePaper: (params: any) => wrap('paper.update')(params),
  deletePaper: (id: number) => wrap('paper.delete')({ id }),

  listTypes: wrap('type.list'),
  createType: (data: any) => wrap('type.create')(data),
  updateType: (params: any) => wrap('type.update')(params),
  deleteType: (id: number) => wrap('type.delete')({ id }),

  listPlaces: wrap('place.list'),
  createPlace: (data: any) => wrap('place.create')(data),
  updatePlace: (params: any) => wrap('place.update')(params),
  deletePlace: (id: number) => wrap('place.delete')({ id }),

  addImages: (params: { artworkId: number; filePaths: string[] }) => wrap('artwork.addImage')(params),
  removeImage: (imageId: number) => wrap('artwork.removeImage')({ imageId }),
  setPreviewImage: (params: { artworkId: number; imageId: number | null }) => wrap('artwork.setPreviewImage')(params),

  backupCatalog: (dest: string) => wrap('catalog.backup')({ destinationPath: dest }),
  restoreCatalog: (src: string) => wrap('catalog.restore')({ sourceZip: src }),

  getDesktopPath: () => wrap('system.desktopPath')(),
  showSaveDialog: (defaultPath?: string) => wrap('system.showSaveDialog')({ defaultPath }),
  onBackupProgress: (cb: (p: { processedBytes: number; totalBytes?: number; processedFiles: number; totalFiles?: number; percent?: number }) => void) => {
    const listener = (_: any, data: any) => cb(data);
    ipcRenderer.on('catalog.backupProgress', listener);
    return () => ipcRenderer.removeListener('catalog.backupProgress', listener);
  },

  // Helper function to convert file paths to custom protocol URLs
  getImageUrl: (filePath: string) => filePath ? `catalogue-image://${encodeURIComponent(filePath)}` : undefined,
});
