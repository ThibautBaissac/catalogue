import React, { useEffect, useState } from 'react';
import { callApi } from '../hooks/useApi';

interface ArtworkDetailSidebarProps {
  artworkId: number;
  onClose: () => void;
  onEdit: () => void;
  onViewArtwork?: (artwork: any, imageIndex?: number) => void;
}

export default function ArtworkDetailSidebar({ artworkId, onClose, onEdit, onViewArtwork }: ArtworkDetailSidebarProps) {
  const [full, setFull] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [artworkId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await callApi(window.api.getArtworkFull, artworkId);
      setFull(data);
    } catch (error) {
      console.error('Error loading artwork details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      const files = Array.from(e.target.files);
      const paths = files.map((f: any) => f.path).filter(Boolean);

      if (paths.length > 0) {
        await callApi(window.api.addImages, { artworkId: full.artwork.id, filePaths: paths });
        load(); // Reload to show new images
      }
    } catch (error) {
      console.error('Error adding images:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ?')) {
      return;
    }

    try {
      await callApi(window.api.deleteArtwork, full.artwork.id);
      onClose();
      // Trigger refresh of artwork list
      window.dispatchEvent(new CustomEvent('artwork-updated'));
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
  };

  const handleDeleteImage = async (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the image

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      await callApi(() => window.api.removeImage(imageId));
      load(); // Reload to show updated images
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageClick = (imageIndex: number) => {
    if (onViewArtwork && full?.artwork) {
      onViewArtwork(full.artwork, imageIndex);
    }
  };

  if (loading) {
    return (
      <aside className="w-80 p-4 bg-white dark:bg-dark-card border-l dark:border-dark-border">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 dark:text-dark-text-secondary">Chargement...</div>
        </div>
      </aside>
    );
  }

  if (!full) {
    return (
      <aside className="w-80 p-4 bg-white dark:bg-dark-card border-l dark:border-dark-border">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 dark:text-dark-text-secondary">Erreur de chargement</div>
        </div>
      </aside>
    );
  }

  const { artwork, images, pigments, papers, collection, type, place } = full;

  return (
    <aside className="w-80 h-full bg-white dark:bg-dark-card border-l dark:border-dark-border flex flex-col">
      <div className="p-4 border-b dark:border-dark-border">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary truncate">
            {artwork.reference}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-text-secondary hover:text-gray-600 dark:hover:text-dark-text-primary text-xl ml-2"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          {artwork.title && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Titre</span>
              <div className="text-sm text-gray-900 dark:text-dark-text-primary">{artwork.title}</div>
            </div>
          )}

          {artwork.description && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Description</span>
              <div className="text-sm text-gray-700 dark:text-dark-text-secondary">{artwork.description}</div>
            </div>
          )}

          {(artwork.width || artwork.height) && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Dimensions</span>
              <div className="text-sm text-gray-900 dark:text-dark-text-primary">
                {artwork.width && artwork.height
                  ? `${artwork.width} × ${artwork.height} cm`
                  : `${artwork.width || artwork.height} cm`
                }
              </div>
            </div>
          )}

          {artwork.date && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Date</span>
              <div className="text-sm text-gray-900 dark:text-dark-text-primary">{artwork.date}</div>
            </div>
          )}

          {collection && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Collection</span>
              <div className="text-sm text-gray-900 dark:text-dark-text-primary">{collection.name}</div>
            </div>
          )}

          {type && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Type</span>
              <div className="text-sm text-gray-900 dark:text-dark-text-primary">{type.name}</div>
            </div>
          )}

          {place && (
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Lieu</span>
              <div className="text-sm text-gray-900 dark:text-dark-text-primary">{place.name}</div>
            </div>
          )}
        </div>

        {/* Pigments */}
        {pigments.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Pigments</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {pigments.map((pigment: any) => (
                <span
                  key={pigment.id}
                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded"
                >
                  {pigment.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Papers */}
        {papers.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">Papiers</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {papers.map((paper: any) => (
                <span
                  key={paper.id}
                  className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded"
                >
                  {paper.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
              Images ({images.length})
            </span>
            <label className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
              + Ajouter
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {images.map((image: any, index: number) => (
                <div
                  key={image.id}
                  className="relative aspect-square bg-gray-100 dark:bg-dark-hover rounded border dark:border-dark-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all group"
                  onClick={() => handleImageClick(index)}
                >
                  {image.thumbnail_path ? (
                    <img
                      src={window.api.getImageUrl(image.thumbnail_path)}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-dark-text-muted">
                      Image
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteImage(image.id, e)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer l'image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary mt-2">
              Aucune image
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t dark:border-dark-border space-y-2">
        <button
          onClick={onEdit}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Éditer
        </button>
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 dark:bg-red-700 text-white py-2 px-4 rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </aside>
  );
}
