import { create } from 'zustand';
import { Artwork } from '../types';

type ViewMode = 'list' | 'grid';

interface ArtworkFilters {
  collectionId?: number;
  pigments?: number[];
  papers?: number[];
  query?: string;
}

interface CatalogState {
  artworks: Artwork[];
  selectedArtwork?: Artwork;
  viewMode: ViewMode;
  filters: ArtworkFilters;
  setArtworks: (a: Artwork[]) => void;
  selectArtwork: (a: Artwork) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: ArtworkFilters) => void;
  clearFilters: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  artworks: [],
  selectedArtwork: undefined,
  viewMode: 'list',
  filters: {},
  setArtworks: (artworks) => set({ artworks }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  clearSelection: () => set({ selectedArtwork: undefined }),
  setViewMode: (viewMode) => set({ viewMode }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
