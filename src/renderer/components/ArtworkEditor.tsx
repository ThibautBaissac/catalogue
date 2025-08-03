import React, { useEffect, useState } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper } from '../types';

interface ArtworkEditorProps {
  initial?: any;
  onSaved: (artwork: any) => void;
  onCancel: () => void;
}

export default function ArtworkEditor({ initial, onSaved, onCancel }: ArtworkEditorProps) {
  const artworkData = initial || {};
  const [reference, setReference] = useState(artworkData.reference || '');
  const [title, setTitle] = useState(artworkData.title || '');
  const [description, setDescription] = useState(artworkData.description || '');
  const [width, setWidth] = useState(artworkData.width || '');
  const [height, setHeight] = useState(artworkData.height || '');
  const [date, setDate] = useState(artworkData.date || '');
  const [collectionId, setCollectionId] = useState(artworkData.collection_id || '');
  const [selectedPigments, setSelectedPigments] = useState<number[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [pigments, setPigments] = useState<Pigment[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!artworkData.id;

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
        const full = await callApi(window.api.getArtworkFull, artworkData.id);
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
      const submissionData = {
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
        await callApi(window.api.updateArtwork, { id: artworkData.id, updates: submissionData });
        artworkId = artworkData.id;
      } else {
        const result = await callApi(window.api.createArtwork, submissionData);
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
    <div className="p-6 bg-dark-card text-dark-text-primary">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-dark-text-primary">
          {isEdit ? 'Modifier l\'œuvre' : 'Nouvelle œuvre'}
        </h2>
        <button
          onClick={onCancel}
          className="text-dark-text-secondary hover:text-dark-text-primary text-xl"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-300 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Référence *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Largeur (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Hauteur (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">
            Collection
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full bg-dark-hover border border-dark-border rounded-md px-3 py-2 text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Pigments
            </label>
            <div className="max-h-32 overflow-y-auto bg-dark-hover border border-dark-border rounded-md p-2">
              {pigments.map(pigment => (
                <label key={pigment.id} className="flex items-center space-x-2 py-1 text-dark-text-primary hover:bg-dark-border/50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={selectedPigments.includes(pigment.id)}
                    onChange={() => togglePigment(pigment.id)}
                    className="rounded border-dark-border bg-dark-hover text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm">{pigment.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Papiers
            </label>
            <div className="max-h-32 overflow-y-auto bg-dark-hover border border-dark-border rounded-md p-2">
              {papers.map(paper => (
                <label key={paper.id} className="flex items-center space-x-2 py-1 text-dark-text-primary hover:bg-dark-border/50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={selectedPapers.includes(paper.id)}
                    onChange={() => togglePaper(paper.id)}
                    className="rounded border-dark-border bg-dark-hover text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
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
            className="px-4 py-2 border border-dark-border text-dark-text-secondary rounded-md hover:bg-dark-hover hover:text-dark-text-primary transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer')}
          </button>
        </div>
      </form>
    </div>
  );
}
