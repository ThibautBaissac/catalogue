import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadArtworkFull();
  }, [artwork.id]);

  useEffect(() => {
    // Reset zoom and pan when changing images
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentImageIndex]);

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

  // Fit image to viewport on initial load
  const fitImageToViewport = useCallback(() => {
    if (!imageRef.current || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const img = imageRef.current;

    // Wait for image to load to get natural dimensions
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      // If image hasn't loaded yet, retry after a short delay
      setTimeout(fitImageToViewport, 100);
      return;
    }

    // Ensure container has valid dimensions
    if (containerRect.width <= 0 || containerRect.height <= 0) {
      // If container hasn't been sized yet, retry after a short delay
      setTimeout(fitImageToViewport, 100);
      return;
    }

    const containerAspectRatio = containerRect.width / containerRect.height;
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;

    let fitZoom;
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider, fit to width
      fitZoom = (containerRect.width - 32) / img.naturalWidth; // 32px for padding
    } else {
      // Image is taller, fit to height
      fitZoom = (containerRect.height - 32) / img.naturalHeight; // 32px for padding
    }

    // Ensure fitZoom is within valid bounds
    fitZoom = Math.max(0.01, Math.min(2.0, fitZoom)); // Allow very small zoom for very large images

    console.log('fitImageToViewport:', {
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      fitZoom,
      imageAspectRatio,
      containerAspectRatio,
      calculatedImageWidth: img.naturalWidth * fitZoom,
      calculatedImageHeight: img.naturalHeight * fitZoom
    });

    // Set zoom as percentage of real image size (fitZoom represents the scale needed to fit)
    setZoom(fitZoom);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle window resize to maintain proper image fitting
  useEffect(() => {
    const handleResize = () => {
      // Only refit if we're currently at fit-to-viewport zoom level
      if (imageRef.current && imageContainerRef.current) {
        const container = imageContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const img = imageRef.current;

        if (img.naturalWidth > 0 && img.naturalHeight > 0 && containerRect.width > 0 && containerRect.height > 0) {
          const containerAspectRatio = containerRect.width / containerRect.height;
          const imageAspectRatio = img.naturalWidth / img.naturalHeight;

          let expectedFitZoom;
          if (imageAspectRatio > containerAspectRatio) {
            expectedFitZoom = (containerRect.width - 32) / img.naturalWidth;
          } else {
            expectedFitZoom = (containerRect.height - 32) / img.naturalHeight;
          }

          // If current zoom is close to what fit zoom should be, update it
          if (Math.abs(zoom - expectedFitZoom) < 0.05) {
            fitImageToViewport();
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoom, fitImageToViewport]);

  // Mouse and touch event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow panning when image is larger than container
    if (!imageRef.current || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const img = imageRef.current;
    const scaledWidth = img.naturalWidth * zoom;
    const scaledHeight = img.naturalHeight * zoom;

    if (scaledWidth <= containerRect.width && scaledHeight <= containerRect.height) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPanX = e.clientX - dragStart.x;
    const newPanY = e.clientY - dragStart.y;

    // Apply pan limits to prevent dragging image too far out of view
    const limitedPan = applyPanLimits(newPanX, newPanY);
    setPan(limitedPan);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile panning
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    // Allow panning when image is larger than container
    if (!imageRef.current || !imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const img = imageRef.current;
    const scaledWidth = img.naturalWidth * zoom;
    const scaledHeight = img.naturalHeight * zoom;

    if (scaledWidth <= containerRect.width && scaledHeight <= containerRect.height) return;

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];

    const newPanX = touch.clientX - dragStart.x;
    const newPanY = touch.clientY - dragStart.y;

    // Apply pan limits to prevent dragging image too far out of view
    const limitedPan = applyPanLimits(newPanX, newPanY);
    setPan(limitedPan);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Helper function to apply pan limits
  const applyPanLimits = (panX: number, panY: number) => {
    if (!imageRef.current || !imageContainerRef.current || zoom <= 0.01) {
      return { x: panX, y: panY };
    }

    const container = imageContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const img = imageRef.current;

    // Calculate the scaled image dimensions
    const scaledWidth = img.naturalWidth * zoom;
    const scaledHeight = img.naturalHeight * zoom;

    // Calculate the maximum pan limits
    const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    // Apply limits
    const limitedPanX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    const limitedPanY = Math.max(-maxPanY, Math.min(maxPanY, panY));

    return { x: limitedPanX, y: limitedPanY };
  };

  // Zoom functions with proper center point maintenance
  const handleZoomChange = (newZoom: number, centerPoint?: { x: number; y: number }) => {
    // Clamp zoom between 1% and 200% of real image size to allow for very large images
    const clampedZoom = Math.max(0.01, Math.min(2.0, newZoom));

    if (clampedZoom === zoom) return;

    let newPan = { x: 0, y: 0 };

    if (centerPoint && imageRef.current && imageContainerRef.current) {
      // Zoom to specific point (like mouse cursor position)
      const container = imageContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      // Calculate the offset from viewport center where the zoom should focus
      const offsetX = centerPoint.x - containerCenterX;
      const offsetY = centerPoint.y - containerCenterY;

      // Calculate new pan to keep the zoom point stable
      const zoomRatio = clampedZoom / zoom;
      newPan = {
        x: (pan.x - offsetX) * zoomRatio + offsetX,
        y: (pan.y - offsetY) * zoomRatio + offsetY
      };
    } else {
      // Zoom from viewport center (for buttons and slider)
      const zoomRatio = clampedZoom / zoom;
      newPan = {
        x: pan.x * zoomRatio,
        y: pan.y * zoomRatio
      };
    }

    setZoom(clampedZoom);

    // Apply pan limits after zoom
    setTimeout(() => {
      const limitedPan = applyPanLimits(newPan.x, newPan.y);
      setPan(limitedPan);
    }, 0);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 2.0);
    handleZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.01);
    handleZoomChange(newZoom);
  };

  const handleResetZoom = () => {
    console.log('Reset zoom called - fitting image to viewport');
    fitImageToViewport();
  };

  // Mouse wheel zoom with zoom-to-cursor
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.01, Math.min(2.0, zoom * delta));

      // Get cursor position relative to the container
      const container = imageContainerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const centerPoint = {
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top
        };
        handleZoomChange(newZoom, centerPoint);
      } else {
        handleZoomChange(newZoom);
      }
    }
  };

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

  const handleDeleteImage = async (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent changing the current image

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      await callApi(() => window.api.removeImage(imageId));
      // Reload artwork data to get updated images
      await loadArtworkFull();

      // Adjust current image index if necessary
      if (artworkFull && currentImageIndex >= artworkFull.images.length) {
        setCurrentImageIndex(Math.max(0, artworkFull.images.length - 1));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
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
      <div
        ref={imageContainerRef}
        className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden min-h-[300px]"
        onWheel={handleWheel}
      >
        {artworkFull.images.length > 0 ? (
          <div
            className="relative w-full h-full flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: (() => {
                if (!imageRef.current || !imageContainerRef.current) return 'default';
                const container = imageContainerRef.current;
                const containerRect = container.getBoundingClientRect();
                const img = imageRef.current;
                const scaledWidth = img.naturalWidth * zoom;
                const scaledHeight = img.naturalHeight * zoom;
                const canPan = scaledWidth > containerRect.width || scaledHeight > containerRect.height;
                return canPan ? (isDragging ? 'grabbing' : 'grab') : 'default';
              })()
            }}
          >
            <img
              ref={imageRef}
              src={window.api.getImageUrl(currentImage.file_path)}
              alt={artwork.title || artwork.reference}
              className="rounded-lg shadow-2xl select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none',
                maxHeight: 'none',
                width: 'auto',
                height: 'auto',
              }}
              onLoad={() => {
                // Add a small delay to ensure container is fully sized
                setTimeout(fitImageToViewport, 50);
              }}
              onError={() => {
                console.error('Error loading image:', currentImage.file_path);
              }}
              onDragStart={(e) => e.preventDefault()}
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

          {/* Zoom Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-dark-text-primary mb-3">Zoom</h3>
            <div className="space-y-3">
              {/* Zoom buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleZoomOut}
                  className="flex-1 bg-dark-hover hover:bg-dark-border text-dark-text-secondary hover:text-dark-text-primary px-3 py-2 rounded text-sm transition-colors"
                  disabled={zoom <= 0.01}
                >
                  Zoom -
                </button>
                <button
                  onClick={handleResetZoom}
                  className="flex-1 bg-dark-hover hover:bg-dark-border text-dark-text-secondary hover:text-dark-text-primary px-3 py-2 rounded text-sm transition-colors"
                >
                  Ajuster
                </button>
                <button
                  onClick={handleZoomIn}
                  className="flex-1 bg-dark-hover hover:bg-dark-border text-dark-text-secondary hover:text-dark-text-primary px-3 py-2 rounded text-sm transition-colors"
                  disabled={zoom >= 2.0}
                >
                  Zoom +
                </button>
              </div>

              {/* Zoom slider */}
              <div className="px-1">
                <input
                  type="range"
                  min="0.01"
                  max="2.0"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-dark-hover rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-dark-text-muted mt-1">
                  <span>1%</span>
                  <span className="text-dark-text-secondary">{Math.round(zoom * 100)}%</span>
                  <span>200%</span>
                </div>
              </div>

              {(() => {
                if (!imageRef.current || !imageContainerRef.current) return null;
                const container = imageContainerRef.current;
                const containerRect = container.getBoundingClientRect();
                const img = imageRef.current;
                const scaledWidth = img.naturalWidth * zoom;
                const scaledHeight = img.naturalHeight * zoom;
                const canPan = scaledWidth > containerRect.width || scaledHeight > containerRect.height;

                return canPan ? (
                  <div className="text-xs text-dark-text-muted">
                    💡 Cliquez et glissez pour déplacer l'image
                  </div>
                ) : null;
              })()}
            </div>
          </div>

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
                  <div
                    key={image.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-full aspect-square rounded overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-blue-500'
                          : 'border-dark-border hover:border-dark-border-light'
                      }`}
                    >
                      <img
                        src={window.api.getImageUrl(image.thumbnail_path || image.file_path)}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteImage(image.id, e)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer l'image"
                    >
                      ✕
                    </button>
                  </div>
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
              <div>• <kbd className="px-1 py-0.5 bg-dark-hover rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-dark-hover rounded text-xs">molette</kbd> Zoom</div>
              <div>• <kbd className="px-1 py-0.5 bg-dark-hover rounded text-xs">Échap</kbd> Fermer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
