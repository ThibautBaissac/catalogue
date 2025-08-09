import { create } from 'zustand';
import { Artwork } from '@shared/types';

type ViewMode = 'list' | 'grid';

interface ArtworkFilters {
  collectionId?: number;
  typeId?: number;
  placeId?: number;
  pigments?: number[];
  papers?: number[];
  query?: string;
  years?: number[]; // selected years filter
  noCollection?: boolean;
  noType?: boolean;
  noPlace?: boolean;
  noPigments?: boolean;
  noPapers?: boolean;
}

interface CatalogState {
  artworks: Artwork[];
  selectedArtwork?: Artwork;
  viewMode: ViewMode;
  gridColumns: number;
  filters: ArtworkFilters;
  totalArtworks: number;
  hasMore: boolean;
  loadingArtworks: boolean;
  setArtworks: (a: Artwork[], total?: number) => void;
  appendArtworks: (a: Artwork[], total?: number) => void;
  resetArtworks: () => void;
  selectArtwork: (a: Artwork) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setGridColumns: (columns: number) => void;
  setFilters: (filters: ArtworkFilters) => void;
  clearFilters: () => void;
  setLoadingArtworks: (loading: boolean) => void;
  setHasMore: (has: boolean) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  artworks: [],
  selectedArtwork: undefined,
  viewMode: 'list',
  gridColumns: 6,
  filters: {},
  totalArtworks: 0,
  hasMore: true,
  loadingArtworks: false,
  setArtworks: (artworks, total) => set({ artworks, totalArtworks: total ?? artworks.length, hasMore: (total ?? artworks.length) > artworks.length }),
  appendArtworks: (more, total) => {
    const current = get().artworks;
    const combined = [...current, ...more];
    const totalCount = total ?? Math.max(get().totalArtworks, combined.length);
    set({ artworks: combined, totalArtworks: totalCount, hasMore: combined.length < totalCount });
  },
  resetArtworks: () => set({ artworks: [], totalArtworks: 0, hasMore: true }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  clearSelection: () => set({ selectedArtwork: undefined }),
  setViewMode: (viewMode) => set({ viewMode }),
  setGridColumns: (gridColumns) => set({ gridColumns }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  setLoadingArtworks: (loadingArtworks) => set({ loadingArtworks }),
  setHasMore: (hasMore) => set({ hasMore }),
}));
