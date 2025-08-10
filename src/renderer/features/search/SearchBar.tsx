import React, { useState, useEffect } from 'react';
import { useCatalogStore } from '../../store/catalogStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { filters, setFilters } = useCatalogStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const newQuery = query.trim() || undefined;
      if (filters.query === newQuery) return; // no change, avoid triggering reload
      // Only update the query field to keep other filters intact
      setFilters({ ...filters, query: newQuery });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, filters.query, setFilters]);

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
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 pl-10 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <div className="absolute left-3 top-2.5 text-neutral-500">
            🔍
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg'
              : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
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
            className="px-3 py-2 text-sm text-neutral-400 hover:text-neutral-100 border border-neutral-700 rounded-lg hover:bg-neutral-700/60 transition-all duration-200"
          >
            Effacer
          </button>
        )}
      </div>

  {showFilters && (
  <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-xl">
          {/* "No" filters section */}
          <div>
            <label className="block text-sm font-medium text-neutral-100 mb-3">
              Afficher seulement les œuvres sans...
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, noCollection: !filters.noCollection })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noCollection
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'
                }`}
              >
                Collection
              </button>
              <button
                onClick={() => setFilters({ ...filters, noType: !filters.noType })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noType
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'
                }`}
              >
                Type
              </button>
              <button
                onClick={() => setFilters({ ...filters, noPlace: !filters.noPlace })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noPlace
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'
                }`}
              >
                Lieu
              </button>
              <button
                onClick={() => setFilters({ ...filters, noPigments: !filters.noPigments })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noPigments
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'
                }`}
              >
                Pigments
              </button>
              <button
                onClick={() => setFilters({ ...filters, noPapers: !filters.noPapers })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  filters.noPapers
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'
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
