import React, { useEffect, useState } from 'react';
import { callApi } from '../hooks/useApi';

export default function ArtworkEditor({ initial = {}, onSaved, onCancel }: any) {
  const [reference, setReference] = useState(initial.reference || '');
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [width, setWidth] = useState(initial.width || 0);
  const [height, setHeight] = useState(initial.height || 0);
  const [date, setDate] = useState(initial.date || '');
  const [collectionId, setCollectionId] = useState(initial.collection_id || null);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initial.id;

  const handleSubmit = async () => {
    if (!reference.trim()) {
      setError('Référence requise');
      return;
    }
    if (isEdit && initial.id) {
      await callApi(window.api.updateArtwork, { id: initial.id, updates: { reference, title, description, width, height, date, collection_id: collectionId } });
      const updated = await callApi(window.api.getArtworkFull, initial.id);
      onSaved(updated.artwork);
    } else {
      const { id } = await callApi(window.api.createArtwork, { reference, title, description, width, height, date, collection_id: collectionId });
      const full = await callApi(window.api.getArtworkFull, id);
      onSaved(full.artwork);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded space-y-4">
      <h2>{isEdit ? 'Modifier œuvre' : 'Nouvelle œuvre'}</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Référence *</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)} className="border p-1 w-full" />
        </div>
        <div>
          <label>Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="border p-1 w-full" />
        </div>
        <div className="col-span-2">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border p-1 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 border">Annuler</button>
        <button onClick={handleSubmit} className="px-3 py-1 bg-blue-600 text-white rounded">
          {isEdit ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </div>
  );
}
