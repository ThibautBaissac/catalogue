export interface ElectronAPI {
  createArtwork: (data: any) => Promise<any>;
  updateArtwork: (params: { id: number; updates: any }) => Promise<any>;
  deleteArtwork: (id: number) => Promise<any>;
  listArtworks: (filters: any) => Promise<any>;
  getArtworkFull: (id: number) => Promise<any>;
  setPigments: (params: { artworkId: number; pigmentIds: number[] }) => Promise<any>;
  setPapers: (params: { artworkId: number; paperIds: number[] }) => Promise<any>;

  listCollections: () => Promise<any>;
  createCollection: (data: any) => Promise<any>;
  updateCollection: (params: any) => Promise<any>;
  deleteCollection: (id: number) => Promise<any>;

  listPigments: () => Promise<any>;
  createPigment: (data: any) => Promise<any>;
  updatePigment: (params: any) => Promise<any>;
  deletePigment: (id: number) => Promise<any>;

  listPapers: () => Promise<any>;
  createPaper: (data: any) => Promise<any>;
  updatePaper: (params: any) => Promise<any>;
  deletePaper: (id: number) => Promise<any>;

  listTypes: () => Promise<any>;
  createType: (data: any) => Promise<any>;
  updateType: (params: any) => Promise<any>;
  deleteType: (id: number) => Promise<any>;

  addImages: (params: { artworkId: number; filePaths: string[] }) => Promise<any>;

  backupCatalog: (dest: string) => Promise<any>;
  restoreCatalog: (src: string) => Promise<any>;

  // Helper function to convert file paths to custom protocol URLs
  getImageUrl: (filePath: string) => string | undefined;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}

// Declare module types for image imports
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
