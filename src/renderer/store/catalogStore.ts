import { create } from 'zustand';
import { Artwork } from '../types';

type ViewMode = 'list' | 'grid';

interface CatalogState {
  artworks: Artwork[];
  selectedArtwork?: Artwork;
  viewMode: ViewMode;
  setArtworks: (a: Artwork[]) => void;
  selectArtwork: (a: Artwork) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  artworks: [],
  selectedArtwork: undefined,
  viewMode: 'list',
  setArtworks: (artworks) => set({ artworks }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  clearSelection: () => set({ selectedArtwork: undefined }),
  setViewMode: (viewMode) => set({ viewMode }),
}));
