import React, { useEffect, useState } from 'react';
import { callApi } from '../hooks/useApi';

interface ArtworkDetailSidebarProps {
  artworkId: number;
  onClose: () => void;
  onEdit: () => void;
}

export default function ArtworkDetailSidebar({ artworkId, onClose, onEdit }: ArtworkDetailSidebarProps) {
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

  if (loading) {
    return (
      <aside className="w-80 p-4 bg-white border-l">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </aside>
    );
  }

  if (!full) {
    return (
      <aside className="w-80 p-4 bg-white border-l">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Erreur de chargement</div>
        </div>
      </aside>
    );
  }

  const { artwork, images, pigments, papers, collection } = full;

  return (
    <aside className="w-80 bg-white border-l flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {artwork.title || artwork.reference}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl ml-2"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Référence</span>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded">
              {artwork.reference}
            </div>
          </div>

          {artwork.title && (
            <div>
              <span className="text-sm font-medium text-gray-500">Titre</span>
              <div className="text-sm">{artwork.title}</div>
            </div>
          )}

          {artwork.description && (
            <div>
              <span className="text-sm font-medium text-gray-500">Description</span>
              <div className="text-sm text-gray-700">{artwork.description}</div>
            </div>
          )}

          {(artwork.width || artwork.height) && (
            <div>
              <span className="text-sm font-medium text-gray-500">Dimensions</span>
              <div className="text-sm">
                {artwork.width && artwork.height
                  ? `${artwork.width} × ${artwork.height} cm`
                  : `${artwork.width || artwork.height} cm`
                }
              </div>
            </div>
          )}

          {artwork.date && (
            <div>
              <span className="text-sm font-medium text-gray-500">Date</span>
              <div className="text-sm">{artwork.date}</div>
            </div>
          )}

          {collection && (
            <div>
              <span className="text-sm font-medium text-gray-500">Collection</span>
              <div className="text-sm">{collection.name}</div>
            </div>
          )}
        </div>

        {/* Pigments */}
        {pigments.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-500">Pigments</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {pigments.map((pigment: any) => (
                <span
                  key={pigment.id}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
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
            <span className="text-sm font-medium text-gray-500">Papiers</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {papers.map((paper: any) => (
                <span
                  key={paper.id}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
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
            <span className="text-sm font-medium text-gray-500">
              Images ({images.length})
            </span>
            <label className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
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
              {images.map((image: any) => (
                <div key={image.id} className="aspect-square bg-gray-100 rounded border overflow-hidden">
                  {image.thumbnail_path ? (
                    <img
                      src={`file://${image.thumbnail_path}`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-2">
              Aucune image
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <button
          onClick={onEdit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </aside>
  );
}
