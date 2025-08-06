import { create } from 'zustand';
import { Artwork } from '../types';

type ViewMode = 'list' | 'grid';

interface ArtworkFilters {
  collectionId?: number;
  typeId?: number;
  placeId?: number;
  pigments?: number[];
  papers?: number[];
  query?: string;
}

interface CatalogState {
  artworks: Artwork[];
  selectedArtwork?: Artwork;
  viewMode: ViewMode;
  gridColumns: number;
  filters: ArtworkFilters;
  setArtworks: (a: Artwork[]) => void;
  selectArtwork: (a: Artwork) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setGridColumns: (columns: number) => void;
  setFilters: (filters: ArtworkFilters) => void;
  clearFilters: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  artworks: [],
  selectedArtwork: undefined,
  viewMode: 'list',
  gridColumns: 6,
  filters: {},
  setArtworks: (artworks) => set({ artworks }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  clearSelection: () => set({ selectedArtwork: undefined }),
  setViewMode: (viewMode) => set({ viewMode }),
  setGridColumns: (gridColumns) => set({ gridColumns }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
