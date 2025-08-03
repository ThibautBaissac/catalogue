import React, { useEffect, useState } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper } from '../types';

interface ArtworkEditorProps {
  initial?: any;
  onSaved: (artwork: any) => void;
  onCancel: () => void;
}

export default function ArtworkEditor({ initial = {}, onSaved, onCancel }: ArtworkEditorProps) {
  const [reference, setReference] = useState(initial.reference || '');
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [width, setWidth] = useState(initial.width || '');
  const [height, setHeight] = useState(initial.height || '');
  const [date, setDate] = useState(initial.date || '');
  const [collectionId, setCollectionId] = useState(initial.collection_id || '');
  const [selectedPigments, setSelectedPigments] = useState<number[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [pigments, setPigments] = useState<Pigment[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!initial.id;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [colls, pigs, paps] = await Promise.all([
        callApi<Collection[]>(window.api.listCollections),
        callApi<Pigment[]>(window.api.listPigments),
        callApi<Paper[]>(window.api.listPapers)
      ]);
      setCollections(colls);
      setPigments(pigs);
      setPapers(paps);

      if (isEdit) {
        const full = await callApi(window.api.getArtworkFull, initial.id);
        setSelectedPigments(full.pigments.map((p: any) => p.id));
        setSelectedPapers(full.papers.map((p: any) => p.id));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setError('Référence requise');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const artworkData = {
        reference: reference.trim(),
        title: title.trim() || null,
        description: description.trim() || null,
        width: width ? parseFloat(width as string) : null,
        height: height ? parseFloat(height as string) : null,
        date: date || null,
        collection_id: collectionId || null
      };

      let artworkId: number;

      if (isEdit) {
        await callApi(window.api.updateArtwork, { id: initial.id, updates: artworkData });
        artworkId = initial.id;
      } else {
        const result = await callApi(window.api.createArtwork, artworkData);
        artworkId = result.id;
      }

      // Update pigments and papers associations
      await Promise.all([
        callApi(window.api.setPigments, { artworkId, pigmentIds: selectedPigments }),
        callApi(window.api.setPapers, { artworkId, paperIds: selectedPapers })
      ]);

      // Get the updated artwork
      const updated = await callApi(window.api.getArtworkFull, artworkId);
      onSaved(updated.artwork);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePigment = (pigmentId: number) => {
    setSelectedPigments(prev =>
      prev.includes(pigmentId)
        ? prev.filter(id => id !== pigmentId)
        : [...prev, pigmentId]
    );
  };

  const togglePaper = (paperId: number) => {
    setSelectedPapers(prev =>
      prev.includes(paperId)
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Modifier l\'œuvre' : 'Nouvelle œuvre'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Référence *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largeur (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hauteur (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Collection
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucune collection</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pigments
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {pigments.map(pigment => (
                <label key={pigment.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedPigments.includes(pigment.id)}
                    onChange={() => togglePigment(pigment.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{pigment.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Papiers
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {papers.map(paper => (
                <label key={paper.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedPapers.includes(paper.id)}
                    onChange={() => togglePaper(paper.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{paper.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer')}
          </button>
        </div>
      </form>
    </div>
  );
}
