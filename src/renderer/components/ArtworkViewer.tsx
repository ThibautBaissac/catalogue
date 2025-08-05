import React, { useState, useEffect } from 'react';
import { callApi } from '../hooks/useApi';
import { Artwork } from '../types';

interface ArtworkViewerProps {
  artwork: Artwork;
  onClose: () => void;
  onEdit: () => void;
  initialImageIndex?: number;
}

interface ArtworkFull {
  artwork: Artwork;
  images: Array<{
    id: number;
    artwork_id: number;
    file_path: string;
    thumbnail_path?: string;
    hash: string;
    created_at: string;
  }>;
  pigments: Array<{ id: number; name: string; description?: string }>;
  papers: Array<{ id: number; name: string; description?: string }>;
  collection?: { id: number; name: string; description?: string; date?: string } | null;
  type?: { id: number; name: string; description?: string } | null;
}

export default function ArtworkViewer({ artwork, onClose, onEdit, initialImageIndex = 0 }: ArtworkViewerProps) {
  const [artworkFull, setArtworkFull] = useState<ArtworkFull | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtworkFull();
  }, [artwork.id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [artworkFull?.images.length]);

  const loadArtworkFull = async () => {
    try {
      setLoading(true);
      const data = await callApi<ArtworkFull>(window.api.getArtworkFull, artwork.id);
      setArtworkFull(data);
      setCurrentImageIndex(initialImageIndex);
    } catch (error) {
      console.error('Error loading artwork details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (artworkFull?.images.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? artworkFull.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (artworkFull?.images.length) {
      setCurrentImageIndex((prev) =>
        prev === artworkFull.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!artworkFull) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-white text-xl">Erreur de chargement</div>
      </div>
    );
  }

  const currentImage = artworkFull.images[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col lg:flex-row z-50">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
      >
        ✕
      </button>

      {/* Image section */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        {artworkFull.images.length > 0 ? (
          <div className="relative max-w-full max-h-full">
            <img
              src={window.api.getImageUrl(currentImage.file_path)}
              alt={artwork.title || artwork.reference}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Image navigation */}
            {artworkFull.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-lg lg:text-xl"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-lg lg:text-xl"
                >
                  →
                </button>

                {/* Image counter */}
                <div className="absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {artworkFull.images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-white text-center">
            <div className="text-4xl lg:text-6xl mb-4 opacity-50">🎨</div>
            <div className="text-lg lg:text-xl">Aucune image disponible</div>
          </div>
        )}
      </div>

      {/* Info sidebar */}
      <div className="w-full lg:w-80 bg-dark-card border-t lg:border-t-0 lg:border-l border-dark-border overflow-y-auto max-h-1/3 lg:max-h-full">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-text-primary mb-2">
              {artwork.title || artwork.reference}
            </h1>
            {artwork.title && (
              <div className="text-sm text-dark-text-muted font-mono">
                {artwork.reference}
              </div>
            )}
          </div>

          {/* Description */}
          {artwork.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-dark-text-primary mb-2">Description</h3>
              <p className="text-dark-text-secondary leading-relaxed">
                {artwork.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-dark-text-primary">Détails</h3>

            {artwork.width && artwork.height && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-text-muted">📏</span>
                <span className="text-dark-text-secondary">
                  {artwork.width} × {artwork.height} cm
                </span>
              </div>
            )}

            {artwork.date && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-text-muted">📅</span>
                <span className="text-dark-text-secondary">{artwork.date}</span>
              </div>
            )}

            {artworkFull.collection && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-text-muted">📚</span>
                <span className="text-dark-text-secondary">{artworkFull.collection.name}</span>
              </div>
            )}

            {artworkFull.type && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-text-muted">🏷️</span>
                <span className="text-dark-text-secondary">{artworkFull.type.name}</span>
              </div>
            )}
          </div>

          {/* Pigments */}
          {artworkFull.pigments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-dark-text-primary mb-3">Pigments</h3>
              <div className="flex flex-wrap gap-2">
                {artworkFull.pigments.map(pigment => (
                  <span
                    key={pigment.id}
                    className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30"
                  >
                    {pigment.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Papers */}
          {artworkFull.papers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-dark-text-primary mb-3">Papiers</h3>
              <div className="flex flex-wrap gap-2">
                {artworkFull.papers.map(paper => (
                  <span
                    key={paper.id}
                    className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs border border-yellow-500/30"
                  >
                    {paper.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail gallery */}
          {artworkFull.images.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-dark-text-primary mb-3">
                Images ({artworkFull.images.length})
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {artworkFull.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-dark-border hover:border-dark-border-light'
                    }`}
                  >
                    <img
                      src={window.api.getImageUrl(image.thumbnail_path || image.file_path)}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Éditer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-dark-text-secondary hover:text-dark-text-primary rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="text-xs text-dark-text-muted border-t border-dark-border pt-4">
            <div className="font-semibold mb-2">Raccourcis clavier :</div>
            <div className="space-y-1">
              <div>• <kbd className="px-1 py-0.5 bg-dark-hover rounded text-xs">←</kbd> <kbd className="px-1 py-0.5 bg-dark-hover rounded text-xs">→</kbd> Navigation images</div>
              <div>• <kbd className="px-1 py-0.5 bg-dark-hover rounded text-xs">Échap</kbd> Fermer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
