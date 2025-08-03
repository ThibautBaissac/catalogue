import React, { useState, useEffect } from 'react';
import { callApi } from '../../hooks/useApi';
import { useCatalogStore } from '../../store/catalogStore';
import { Pigment, Paper, Collection } from '../../types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [selectedPigments, setSelectedPigments] = useState<number[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [pigments, setPigments] = useState<Pigment[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const { setArtworks } = useCatalogStore();

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      doSearch();
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, selectedPigments, selectedPapers, selectedCollection]);

  const loadFilterData = async () => {
    try {
      const [pigs, paps, colls] = await Promise.all([
        callApi<Pigment[]>(window.api.listPigments),
        callApi<Paper[]>(window.api.listPapers),
        callApi<Collection[]>(window.api.listCollections)
      ]);
      setPigments(pigs);
      setPapers(paps);
      setCollections(colls);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const doSearch = async () => {
    try {
      const filters: any = {};

      if (query.trim()) filters.query = query.trim();
      if (selectedPigments.length) filters.pigments = selectedPigments;
      if (selectedPapers.length) filters.papers = selectedPapers;
      if (selectedCollection) filters.collectionId = selectedCollection;

      const results = await callApi(window.api.listArtworks, filters);
      setArtworks(results);
    } catch (error) {
      console.error('Error searching:', error);
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

  const clearFilters = () => {
    setQuery('');
    setSelectedPigments([]);
    setSelectedPapers([]);
    setSelectedCollection(null);
  };

  const hasActiveFilters = query || selectedPigments.length || selectedPapers.length || selectedCollection;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre, référence ou description..."
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 pl-10 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <div className="absolute left-3 top-2.5 text-dark-text-muted">
            🔍
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg'
              : 'border-dark-border text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
          }`}
        >
          Filtres {hasActiveFilters && (
            <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {(selectedPigments.length || 0) + (selectedPapers.length || 0) + (selectedCollection ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-dark-text-secondary hover:text-dark-text-primary border border-dark-border rounded-lg hover:bg-dark-hover transition-all duration-200"
          >
            Effacer
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Collection Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Collection
              </label>
              <select
                value={selectedCollection || ''}
                onChange={(e) => setSelectedCollection(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Toutes les collections</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pigments Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Pigments
              </label>
              <div className="max-h-32 overflow-y-auto bg-dark-bg border border-dark-border rounded-md p-2 custom-scrollbar">
                {pigments.map(pigment => (
                  <label key={pigment.id} className="flex items-center space-x-2 py-1 hover:bg-dark-hover rounded px-1 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPigments.includes(pigment.id)}
                      onChange={() => togglePigment(pigment.id)}
                      className="rounded border-dark-border text-blue-600 focus:ring-blue-500 bg-dark-bg"
                    />
                    <span className="text-sm text-dark-text-secondary">{pigment.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Papers Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Papiers
              </label>
              <div className="max-h-32 overflow-y-auto bg-dark-bg border border-dark-border rounded-md p-2 custom-scrollbar">
                {papers.map(paper => (
                  <label key={paper.id} className="flex items-center space-x-2 py-1 hover:bg-dark-hover rounded px-1 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPapers.includes(paper.id)}
                      onChange={() => togglePaper(paper.id)}
                      className="rounded border-dark-border text-blue-600 focus:ring-blue-500 bg-dark-bg"
                    />
                    <span className="text-sm text-dark-text-secondary">{paper.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedPigments.map(pigmentId => {
            const pigment = pigments.find(p => p.id === pigmentId);
            return pigment && (
              <span
                key={`pigment-${pigmentId}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30"
              >
                🎨 {pigment.name}
                <button
                  onClick={() => togglePigment(pigmentId)}
                  className="text-red-400 hover:text-red-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-colors"
                >
                  ×
                </button>
              </span>
            );
          })}

          {selectedPapers.map(paperId => {
            const paper = papers.find(p => p.id === paperId);
            return paper && (
              <span
                key={`paper-${paperId}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30"
              >
                📄 {paper.name}
                <button
                  onClick={() => togglePaper(paperId)}
                  className="text-yellow-400 hover:text-yellow-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-yellow-500/20 transition-colors"
                >
                  ×
                </button>
              </span>
            );
          })}

          {selectedCollection && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
              📚 {collections.find(c => c.id === selectedCollection)?.name}
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-blue-400 hover:text-blue-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-blue-500/20 transition-colors"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
