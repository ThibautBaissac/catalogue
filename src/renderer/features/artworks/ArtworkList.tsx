import React, { useEffect, useRef } from 'react';
import { useCatalogStore } from '../../store/catalogStore';
import { callApi } from '../../hooks/useApi';
import { Artwork } from '../../types';

export default function ArtworkList() {
  const { artworks, setArtworks, selectArtwork } = useCatalogStore();
  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    callApi<Artwork[]>(window.api.listArtworks, {}).then(setArtworks).catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      {artworks.map((art) => (
        <div
          key={art.id}
          className="border rounded p-3 flex items-center gap-4 hover:shadow cursor-pointer bg-white"
          onClick={() => selectArtwork(art)}
        >
          <div className="w-16 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center">
            <div className="text-xs">{art.reference}</div>
          </div>
          <div className="flex-1">
            <div className="font-semibold">{art.title || art.reference}</div>
            <div className="text-sm text-gray-600">{art.description}</div>
          </div>
          <div className="text-xs text-gray-500">{art.date}</div>
        </div>
      ))}
    </div>
  );
}
