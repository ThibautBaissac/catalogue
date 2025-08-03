import React, { useState, useEffect } from 'react';
import { callApi } from '../../hooks/useApi';
import { useCatalogStore } from '../../store/catalogStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [selectedPigments, setSelectedPigments] = useState<number[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);
  const { setArtworks } = useCatalogStore();

  const doSearch = async () => {
    const filters: any = {
      query: query.trim() || undefined,
      pigments: selectedPigments.length ? selectedPigments : undefined,
      papers: selectedPapers.length ? selectedPapers : undefined,
    };
    const results = await callApi<any[]>(window.api.listArtworks, filters);
    setArtworks(results);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      doSearch();
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, selectedPigments, selectedPapers]);

  return (
    <div className="flex gap-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher..."
        className="flex-1 border rounded px-3 py-2"
      />
    </div>
  );
}
