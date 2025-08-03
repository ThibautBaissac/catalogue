import { create } from 'zustand';
import { Artwork } from '../types';

interface CatalogState {
  artworks: Artwork[];
  selectedArtwork?: Artwork;
  setArtworks: (a: Artwork[]) => void;
  selectArtwork: (a: Artwork) => void;
  clearSelection: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  artworks: [],
  selectedArtwork: undefined,
  setArtworks: (artworks) => set({ artworks }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  clearSelection: () => set({ selectedArtwork: undefined }),
}));
