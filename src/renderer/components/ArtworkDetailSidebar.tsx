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

  const handlePickImages = async () => {
    try {
      const dialogPaths = await callApi(window.api.openFileDialog, {
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }],
        properties: ['openFile', 'multiSelections']
      });
      if (!dialogPaths || dialogPaths.length === 0) return;
      const wasEmpty = (full?.images?.length || 0) === 0;
      await callApi(window.api.addImages, { artworkId: full.artwork.id, filePaths: dialogPaths });
      if (wasEmpty) window.dispatchEvent(new CustomEvent('artwork-updated'));
      load();
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
  // Notify artwork list/grid to refresh preview thumbnail if needed
  window.dispatchEvent(new CustomEvent('artwork-updated'));
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
  <aside className="w-80 p-4 bg-neutral-800 border-l border-neutral-700">
        <div className="flex items-center justify-center h-32">
          <div className="text-neutral-500">Chargement...</div>
        </div>
      </aside>
    );
  }

  if (!full) {
    return (
  <aside className="w-80 p-4 bg-neutral-800 border-l border-neutral-700">
        <div className="flex items-center justify-center h-32">
          <div className="text-neutral-500">Erreur de chargement</div>
        </div>
      </aside>
    );
  }

  const { artwork, images, pigments, papers, collection, type, place } = full;

  return (
  <aside className="w-80 h-full bg-neutral-800 border-l border-neutral-700 flex flex-col">
  <div className="p-4 border-b border-neutral-700">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-neutral-100 truncate">
            {artwork.reference}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 text-xl ml-2"
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
              <span className="text-sm font-medium text-neutral-500">Titre</span>
              <div className="text-sm text-neutral-100">{artwork.title}</div>
            </div>
          )}

          {artwork.owner && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Propriétaire</span>
              <div className="text-sm text-neutral-100">{artwork.owner}</div>
            </div>
          )}

          {artwork.description && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Description</span>
              <div className="text-sm text-neutral-300">{artwork.description}</div>
            </div>
          )}

          {(artwork.width || artwork.height) && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Dimensions</span>
              <div className="text-sm text-neutral-100">
                {artwork.width && artwork.height
                  ? `${artwork.width} × ${artwork.height} cm`
                  : `${artwork.width || artwork.height} cm`
                }
              </div>
            </div>
          )}

          {artwork.date && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Date</span>
              <div className="text-sm text-neutral-100">{artwork.date}</div>
            </div>
          )}

          {collection && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Collection</span>
              <div className="text-sm text-neutral-100">{collection.name}</div>
            </div>
          )}

          {type && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Type</span>
              <div className="text-sm text-neutral-100">{type.name}</div>
            </div>
          )}

          {place && (
            <div>
              <span className="text-sm font-medium text-neutral-500">Lieu</span>
              <div className="text-sm text-neutral-100">{place.name}</div>
            </div>
          )}
        </div>

        {/* Pigments */}
        {pigments.length > 0 && (
          <div>
            <span className="text-sm font-medium text-neutral-500">Pigments</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {pigments.map((pigment: any) => (
                <span
                  key={pigment.id}
                  className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
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
            <span className="text-sm font-medium text-neutral-500">Papiers</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {papers.map((paper: any) => (
                <span
                  key={paper.id}
                  className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded"
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
            <span className="text-sm font-medium text-neutral-500">Images ({images.length})</span>
            <button
              onClick={handlePickImages}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
              type="button"
            >
              + Ajouter
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {images.map((image: any, index: number) => (
                <div
                  key={image.id}
                  className="relative aspect-square bg-neutral-700/60 rounded border border-neutral-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group"
                  onClick={() => handleImageClick(index)}
                >
                  {image.thumbnail_path ? (
                    <img
                      src={window.api.getImageUrl(image.thumbnail_path)}
                      alt="Thumbnail"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
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
            <div className="text-sm text-neutral-500 mt-2">
              Aucune image
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
  <div className="p-4 border-t border-neutral-700 space-y-2">
        {onViewArtwork && (
          <button
            onClick={() => onViewArtwork(artwork)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Voir
          </button>
        )}
        <button
          onClick={onEdit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Éditer
        </button>
        <button
          onClick={handleDelete}
          className="w-full border-2 border-red-600 text-red-600 py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
        >
          Supprimer
        </button>
      </div>
    </aside>
  );
}
