import React, { useState, useEffect } from 'react';
import { callApi } from '../../hooks/useApi';
import { useCatalogStore } from '../../store/catalogStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { setArtworks } = useCatalogStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      doSearch();
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, dateFrom, dateTo]);

  const doSearch = async () => {
    try {
      const filters: any = {};

      if (query.trim()) filters.query = query.trim();
      if (dateFrom || dateTo) {
        filters.dateRange = {};
        if (dateFrom) filters.dateRange.from = dateFrom;
        if (dateTo) filters.dateRange.to = dateTo;
      }

      const results = await callApi(window.api.listArtworks, filters);
      setArtworks(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = query || dateFrom || dateTo;

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
              {(dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-text-primary mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-md px-3 py-2 text-sm text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {dateFrom && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
              📅 À partir de {dateFrom}
              <button
                onClick={() => setDateFrom('')}
                className="text-green-400 hover:text-green-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-green-500/20 transition-colors"
              >
                ×
              </button>
            </span>
          )}

          {dateTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
              � Jusqu'à {dateTo}
              <button
                onClick={() => setDateTo('')}
                className="text-purple-400 hover:text-purple-300 ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-purple-500/20 transition-colors"
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
