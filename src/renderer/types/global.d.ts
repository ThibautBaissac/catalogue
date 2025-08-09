import type { Artwork, ArtworkFilters, ArtworkFull, Collection, Pigment, Paper, Type, Place } from '@shared/types';

// Paginated response for artworks
export interface PaginatedArtworks {
  items: Artwork[];
  total: number;
  hasMore: boolean;
}

export interface ElectronAPI {
  createArtwork: (data: Partial<Artwork>) => Promise<{ id: number }>;
  updateArtwork: (params: { id: number; updates: Partial<Artwork> }) => Promise<void>;
  deleteArtwork: (id: number) => Promise<void>;
  listArtworks: (filters: ArtworkFilters) => Promise<Artwork[] | PaginatedArtworks>; // backward compatible until all callers updated
  getArtworkFull: (id: number) => Promise<ArtworkFull>;
  listYears: () => Promise<{ year: number; count: number }[]>;
  setPigments: (params: { artworkId: number; pigmentIds: number[] }) => Promise<void>;
  setPapers: (params: { artworkId: number; paperIds: number[] }) => Promise<void>;

  listCollections: () => Promise<Collection[]>;
  createCollection: (data: Partial<Collection>) => Promise<{ id: number }>;
  updateCollection: (params: { id: number; updates: Partial<Collection> }) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;

  listPigments: () => Promise<Pigment[]>;
  createPigment: (data: Partial<Pigment>) => Promise<{ id: number }>;
  updatePigment: (params: { id: number; updates: Partial<Pigment> }) => Promise<void>;
  deletePigment: (id: number) => Promise<void>;

  listPapers: () => Promise<Paper[]>;
  createPaper: (data: Partial<Paper>) => Promise<{ id: number }>;
  updatePaper: (params: { id: number; updates: Partial<Paper> }) => Promise<void>;
  deletePaper: (id: number) => Promise<void>;

  listTypes: () => Promise<Type[]>;
  createType: (data: Partial<Type>) => Promise<{ id: number }>;
  updateType: (params: { id: number; updates: Partial<Type> }) => Promise<void>;
  deleteType: (id: number) => Promise<void>;

  listPlaces: () => Promise<Place[]>;
  createPlace: (data: Partial<Place>) => Promise<{ id: number }>;
  updatePlace: (params: { id: number; updates: Partial<Place> }) => Promise<void>;
  deletePlace: (id: number) => Promise<void>;

  addImages: (params: { artworkId: number; filePaths: string[] }) => Promise<void>;
  removeImage: (imageId: number) => Promise<void>;
  setPreviewImage: (params: { artworkId: number; imageId: number | null }) => Promise<void>;

  backupCatalog: (dest: string) => Promise<void>;
  restoreCatalog: (src: string) => Promise<void>;

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
