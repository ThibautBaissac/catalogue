import React, { useEffect, useRef } from 'react';
import { useCatalogStore } from '../../store/catalogStore';
import { callApi } from '../../hooks/useApi';
import { Artwork } from '../../types';

interface ArtworkListProps {
  onEdit: (artwork: Artwork) => void;
  onView: (artwork: Artwork) => void;
}

export default function ArtworkList({ onEdit, onView }: ArtworkListProps) {
  const { artworks, setArtworks, selectArtwork, selectedArtwork, viewMode, setViewMode, gridColumns, setGridColumns, filters, setFilters, clearFilters } = useCatalogStore();
  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadArtworks();
  }, [filters]); // Re-load when filters change

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
      const data = await callApi<Artwork[]>(window.api.listArtworks, filters);
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

  const handleViewClick = (e: React.MouseEvent, artwork: Artwork) => {
    e.stopPropagation();
    onView(artwork);
  };

  const hasActiveFilters = () => {
    return filters.collectionId ||
           filters.typeId ||
           filters.placeId ||
           (filters.pigments && filters.pigments.length > 0) ||
           (filters.papers && filters.papers.length > 0) ||
           filters.noCollection ||
           filters.noType ||
           filters.noPlace ||
           filters.noPigments ||
           filters.noPapers;
  };

  if (artworks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-text-muted">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">🎨</div>
          {hasActiveFilters() ? (
            <>
              <div className="text-lg mb-2 text-dark-text-secondary">Aucune œuvre correspondant aux filtres</div>
              <div className="text-sm mb-4">Essayez de modifier vos critères de recherche</div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-all duration-200 border border-orange-500/30 hover:border-orange-500/50"
              >
                🔄 Afficher toutes les œuvres
              </button>
            </>
          ) : (
            <>
              <div className="text-lg mb-2 text-dark-text-secondary">Aucune œuvre dans votre catalogue</div>
              <div className="text-sm">Cliquez sur "Nouvelle œuvre" pour commencer</div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-dark-text-primary">
            Œuvres ({artworks.length})
          </h2>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-all duration-200 border border-orange-500/30 hover:border-orange-500/50"
            >
              🔄 Tout afficher
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white'
                : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
            }`}
          >
            Grille
          </button>

          {viewMode === 'grid' && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-dark-border">
              <span className="text-sm text-dark-text-secondary">Colonnes:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={gridColumns}
                onChange={(e) => setGridColumns(parseInt(e.target.value))}
                className="w-20 h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((gridColumns - 1) / 9) * 100}%, #374151 ${((gridColumns - 1) / 9) * 100}%, #374151 100%)`
                }}
              />
              <span className="text-sm text-dark-text-primary font-mono min-w-[1.5rem] text-center">
                {gridColumns}
              </span>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
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
              <div className="w-16 h-16 bg-dark-bg flex-shrink-0 flex items-center justify-center rounded border border-dark-border overflow-hidden">
                {artwork.primaryImage?.thumbnail_path ? (
                  <img
                    src={window.api.getImageUrl(artwork.primaryImage.thumbnail_path)}
                    alt={artwork.title || artwork.reference}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to reference text if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-xs text-dark-text-muted font-mono ${artwork.primaryImage?.thumbnail_path ? 'hidden' : ''}`}>
                  {artwork.reference}
                </div>
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
                  onClick={(e) => handleViewClick(e, artwork)}
                  className="px-3 py-1.5 text-sm text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200 border border-green-500/30 hover:border-green-500/50"
                >
                  Voir
                </button>
                <button
                  onClick={(e) => handleEditClick(e, artwork)}
                  className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
                >
                  Éditer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`border border-dark-border rounded-lg p-3 hover:shadow-xl transition-all duration-200 cursor-pointer bg-dark-card aspect-square flex flex-col min-w-[150px] ${
                selectedArtwork?.id === artwork.id
                  ? 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500/50'
                  : 'hover:bg-dark-hover hover:border-dark-border-light'
              }`}
              onClick={() => handleArtworkClick(artwork)}
            >
              <div className="flex-1 flex items-center justify-center bg-dark-bg rounded border border-dark-border mb-2 overflow-hidden min-h-[100px]">
                {artwork.primaryImage?.thumbnail_path ? (
                  <img
                    src={window.api.getImageUrl(artwork.primaryImage.thumbnail_path)}
                    alt={artwork.title || artwork.reference}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to reference text if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-xs text-dark-text-muted font-mono text-center p-2 ${artwork.primaryImage?.thumbnail_path ? 'hidden' : ''}`}>
                  {artwork.reference}
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="font-semibold text-dark-text-primary text-sm truncate mb-1">
                  {artwork.title || artwork.reference}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-dark-text-muted">
                    {artwork.width && artwork.height && (
                      <span>{artwork.width}×{artwork.height}cm</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleViewClick(e, artwork)}
                      className="text-xs text-green-400 hover:text-green-300 p-1 rounded transition-all duration-200"
                      title="Voir"
                    >
                      👁️
                    </button>
                    <button
                      onClick={(e) => handleEditClick(e, artwork)}
                      className="text-xs text-blue-400 hover:text-blue-300 p-1 rounded transition-all duration-200"
                      title="Éditer"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
