import React, { useEffect, useRef } from 'react';
import { useCatalogStore } from '../../store/catalogStore';
import { callApi } from '../../hooks/useApi';
import { Artwork } from '../../types';

interface ArtworkListProps {
  onEdit: (artwork: Artwork) => void;
}

export default function ArtworkList({ onEdit }: ArtworkListProps) {
  const { artworks, setArtworks, selectArtwork, selectedArtwork } = useCatalogStore();
  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadArtworks();

    // Listen for artwork updates
    const handleArtworkUpdate = () => {
      loadArtworks();
    };

    window.addEventListener('artwork-updated', handleArtworkUpdate);

    return () => {
      window.removeEventListener('artwork-updated', handleArtworkUpdate);
    };
  }, []);

  const loadArtworks = async () => {
    try {
      const data = await callApi<Artwork[]>(window.api.listArtworks, {});
      setArtworks(data);
    } catch (error) {
      console.error('Error loading artworks:', error);
    }
  };

  const handleArtworkClick = (artwork: Artwork) => {
    selectArtwork(artwork);
  };

  const handleEditClick = (e: React.MouseEvent, artwork: Artwork) => {
    e.stopPropagation();
    onEdit(artwork);
  };

  if (artworks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-text-muted">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">🎨</div>
          <div className="text-lg mb-2 text-dark-text-secondary">Aucune œuvre dans votre catalogue</div>
          <div className="text-sm">Cliquez sur "Nouvelle œuvre" pour commencer</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-dark-text-primary">
          Œuvres ({artworks.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            className={`border border-dark-border rounded-lg p-4 flex items-center gap-4 hover:shadow-xl transition-all duration-200 cursor-pointer bg-dark-card ${
              selectedArtwork?.id === artwork.id
                ? 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500/50'
                : 'hover:bg-dark-hover hover:border-dark-border-light'
            }`}
            onClick={() => handleArtworkClick(artwork)}
          >
            <div className="w-16 h-16 bg-dark-bg flex-shrink-0 flex items-center justify-center rounded border border-dark-border">
              <div className="text-xs text-dark-text-muted font-mono">{artwork.reference}</div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-dark-text-primary truncate">
                {artwork.title || artwork.reference}
              </div>
              {artwork.description && (
                <div className="text-sm text-dark-text-secondary line-clamp-2 mt-1">
                  {artwork.description}
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-dark-text-muted">
                {artwork.width && artwork.height && (
                  <span className="flex items-center gap-1">
                    📏 {artwork.width} × {artwork.height} cm
                  </span>
                )}
                {artwork.date && (
                  <span className="flex items-center gap-1">
                    📅 {artwork.date}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleEditClick(e, artwork)}
                className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
              >
                ✏️ Éditer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
