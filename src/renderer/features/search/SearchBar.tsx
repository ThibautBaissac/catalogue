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
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Filtres {hasActiveFilters && `(${
            (selectedPigments.length || 0) +
            (selectedPapers.length || 0) +
            (selectedCollection ? 1 : 0)
          })`}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Effacer
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Collection Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection
              </label>
              <select
                value={selectedCollection || ''}
                onChange={(e) => setSelectedCollection(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{pigment.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Papers Filter */}
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{paper.name}</span>
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
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {pigment.name}
                <button
                  onClick={() => togglePigment(pigmentId)}
                  className="text-blue-600 hover:text-blue-800"
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
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {paper.name}
                <button
                  onClick={() => togglePaper(paperId)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            );
          })}

          {selectedCollection && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {collections.find(c => c.id === selectedCollection)?.name}
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-purple-600 hover:text-purple-800"
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
