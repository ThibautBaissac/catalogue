import React, { useState, useEffect } from 'react';
import { callApi } from '../../hooks/useApi';
import { useCatalogStore } from '../../store/catalogStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { setArtworks, filters, setFilters } = useCatalogStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      doSearch();
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const doSearch = async () => {
    try {
      const filters: any = {};

      if (query.trim()) filters.query = query.trim();
  // date filters removed; year-based filtering is handled via sidebar

      const results = await callApi(window.api.listArtworks, filters);
      setArtworks(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({});
  };

  const hasActiveFilters = query ||
    filters.noCollection || filters.noType || filters.noPlace ||
    filters.noPigments || filters.noPapers;

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
              {(filters.noCollection ? 1 : 0) + (filters.noType ? 1 : 0) +
               (filters.noPlace ? 1 : 0) + (filters.noPigments ? 1 : 0) +
               (filters.noPapers ? 1 : 0)}
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
          {/* "No" filters section */}
          <div>
            <label className="block text-sm font-medium text-dark-text-primary mb-3">
              Afficher seulement les œuvres sans...
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, noCollection: !filters.noCollection })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noCollection
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
                }`}
              >
                Collection
              </button>
              <button
                onClick={() => setFilters({ ...filters, noType: !filters.noType })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noType
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
                }`}
              >
                Type
              </button>
              <button
                onClick={() => setFilters({ ...filters, noPlace: !filters.noPlace })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noPlace
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
                }`}
              >
                Lieu
              </button>
              <button
                onClick={() => setFilters({ ...filters, noPigments: !filters.noPigments })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noPigments
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
                }`}
              >
                Pigments
              </button>
              <button
                onClick={() => setFilters({ ...filters, noPapers: !filters.noPapers })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noPapers
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover border border-dark-border'
                }`}
              >
                Papiers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
  {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.noCollection && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
              � Sans collection
              <button
                onClick={() => setFilters({ ...filters, noCollection: false })}
                className="text-orange-400 hover:text-orange-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-orange-500/20 transition-colors"
              >
                ×
              </button>
            </span>
          )}

          {filters.noType && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
              🏷️ Sans type
              <button
                onClick={() => setFilters({ ...filters, noType: false })}
                className="text-orange-400 hover:text-orange-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-orange-500/20 transition-colors"
              >
                ×
              </button>
            </span>
          )}

          {filters.noPlace && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
              � Sans lieu
              <button
                onClick={() => setFilters({ ...filters, noPlace: false })}
                className="text-orange-400 hover:text-orange-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-orange-500/20 transition-colors"
              >
                ×
              </button>
            </span>
          )}

          {filters.noPigments && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
              🎨 Sans pigments
              <button
                onClick={() => setFilters({ ...filters, noPigments: false })}
                className="text-orange-400 hover:text-orange-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-orange-500/20 transition-colors"
              >
                ×
              </button>
            </span>
          )}

          {filters.noPapers && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
              � Sans papiers
              <button
                onClick={() => setFilters({ ...filters, noPapers: false })}
                className="text-orange-400 hover:text-orange-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-orange-500/20 transition-colors"
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
