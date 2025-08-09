import { create } from 'zustand';
import { Collection, Type, Place, Pigment, Paper } from '@shared/types';
import { callApi } from '../hooks/useApi';

interface LookupState {
  collections: Collection[];
  types: Type[];
  places: Place[];
  pigments: Pigment[];
  papers: Paper[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useLookupStore = create<LookupState>((set, get) => ({
  collections: [],
  types: [],
  places: [],
  pigments: [],
  papers: [],
  loading: false,
  loaded: false,
  load: async () => {
    if (get().loaded || get().loading) return; // prevent duplicate initial loads
    await get().refresh();
  },
  refresh: async () => {
    set({ loading: true });
    try {
      const [collections, types, pigments, papers, places] = await Promise.all([
        callApi(window.api.listCollections),
        callApi(window.api.listTypes),
        callApi(window.api.listPigments),
        callApi(window.api.listPapers),
        callApi(window.api.listPlaces)
      ]);
      set({ collections, types, pigments, papers, places, loaded: true });
    } catch (e) {
      console.error('Lookup load error', e);
    } finally {
      set({ loading: false });
    }
  }
}));
