import React, { useEffect, useState } from 'react';
import { callApi } from '../hooks/useApi';

export default function ArtworkDetailSidebar({ artworkId, onClose, refreshList }: any) {
  const [full, setFull] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    const data = await callApi<any>(window.api.getArtworkFull, artworkId);
    setFull(data);
  };

  useEffect(() => {
    load();
  }, [artworkId]);

  if (!full) return <div className="p-4">Chargement...</div>;

  const { artwork, images, pigments, papers, collection } = full;

  const handleSave = (updated: any) => {
    setEditing(false);
    load();
    refreshList();
  };

  const handleAddImages = async (e: any) => {
    if (!e.target.files) return;
    const paths = Array.from(e.target.files).map((f: any) => f.path);
    await callApi(window.api.addImages, { artworkId: artwork.id, filePaths: paths });
    load();
  };

  return (
    <aside className="w-96 p-4 bg-white border-l">
      <div className="flex justify-between">
        <h2>{artwork.title || artwork.reference}</h2>
        <button onClick={onClose}>✕</button>
      </div>
      {editing ? (
        <div>Édition...</div>
      ) : (
        <div className="space-y-2">
          <div><strong>Référence :</strong> {artwork.reference}</div>
          <div><strong>Titre :</strong> {artwork.title}</div>
          <div><strong>Description :</strong> {artwork.description}</div>
          <div><strong>Date :</strong> {artwork.date}</div>
          <div><strong>Collection :</strong> {collection?.name}</div>
          <div><strong>Pigments :</strong> {pigments.map((p: any) => p.name).join(', ')}</div>
          <div><strong>Papiers :</strong> {papers.map((p: any) => p.name).join(', ')}</div>
          <div>
            <label>Ajouter images</label>
            <input type="file" multiple onChange={handleAddImages} />
          </div>
        </div>
      )}
    </aside>
  );
}
