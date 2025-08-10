import React, { useState, useEffect, useMemo } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper, Type, Place } from '@shared/types';
import { useLookupStore } from '../store/lookupStore';
import { useCatalogStore } from '../store/catalogStore';
import DataManager from './DataManager';
import logoImg from '../assets/images/logo.jpg';

interface SidebarProps {
  onNewArtwork: () => void;
  onFilterByCollection: (collectionId: number) => void;
  onFilterByType: (typeId: number) => void;
  onFilterByPigment: (pigmentId: number) => void;
  onFilterByPaper: (paperId: number) => void;
  onFilterByPlace: (placeId: number) => void;
}

export default function Sidebar({ onNewArtwork, onFilterByCollection, onFilterByType, onFilterByPlace, onFilterByPigment, onFilterByPaper }: SidebarProps) {
  const { filters, setFilters } = useCatalogStore();
  // Search & simple filters state (moved from former SearchBar)
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { collections, types, places, pigments, papers, load: loadLookups, refresh: refreshLookups, loading: lookupsLoading } = useLookupStore();
  const [years, setYears] = useState<{ year: number; count: number }[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState<boolean>(false);
  const [typesOpen, setTypesOpen] = useState<boolean>(false);
  const [placesOpen, setPlacesOpen] = useState<boolean>(false);
  const [pigmentsOpen, setPigmentsOpen] = useState<boolean>(false);
  const [papersOpen, setPapersOpen] = useState<boolean>(false);
  const [yearsOpen, setYearsOpen] = useState<boolean>(false);
  const [showDataManager, setShowDataManager] = useState<'collections' | 'types' | 'pigments' | 'papers' | 'places' | null>(null);
  const [backupProgress, setBackupProgress] = useState<{ percent?: number; processedBytes: number; totalBytes?: number } | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Initial load: include years + lookups
  useEffect(() => { loadData(); }, []);

  // Debounced query update -> filters
  useEffect(() => {
    const timeout = setTimeout(() => {
      const newQuery = query.trim() || undefined;
      if (filters.query === newQuery) return;
      setFilters({ ...filters, query: newQuery });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, filters.query]);

  const loadData = async () => {
    try {
      const yrs = await callApi(window.api.listYears);
      setYears(yrs);
      await loadLookups();
    } catch (error) { console.error('Error loading sidebar data:', error); }
  };

  const toggleSection = (section: string) => {
    switch (section) {
      case 'collections':
        setCollectionsOpen(!collectionsOpen);
        break;
      case 'types':
        setTypesOpen(!typesOpen);
        break;
      case 'pigments':
        setPigmentsOpen(!pigmentsOpen);
        break;
      case 'papers':
        setPapersOpen(!papersOpen);
        break;
      case 'places':
        setPlacesOpen(!placesOpen);
        break;
      case 'years':
        setYearsOpen(!yearsOpen);
        break;
    }
  };

  const handleManageData = (type: 'collections' | 'types' | 'pigments' | 'papers' | 'places') => {
    setShowDataManager(type);
  };

  const toggleYear = (year: number) => {
    const current = filters.years || [];
    if (current.includes(year)) {
      const next = current.filter(y => y !== year);
      setFilters({ ...filters, years: next.length ? next : undefined });
    } else {
      setFilters({ ...filters, years: [...current, year] });
    }
  };

  const handleCloseDataManager = () => { setShowDataManager(null); refreshLookups(); loadData(); };

  const handleBackup = async () => {
    try {
  const desktop = await callApi(window.api.getDesktopPath);
  const defaultPath = `${desktop.replace(/\/$/, '')}/catalogue-backup-${new Date().toISOString().split('T')[0]}.zip`;
  const chosen = await callApi(window.api.showSaveDialog, defaultPath);
  if (!chosen) return; // user canceled
      setIsBackingUp(true);
      setBackupProgress({ percent: 0, processedBytes: 0 });
      const unsubscribe = window.api.onBackupProgress((p) => {
        setBackupProgress({ percent: p.percent, processedBytes: p.processedBytes, totalBytes: p.totalBytes });
        if (p.percent === 100) {
          setTimeout(() => {
            setIsBackingUp(false);
            setBackupProgress(null);
            alert(`Sauvegarde créée : ${chosen}`);
            unsubscribe();
          }, 300);
        }
      });
      await callApi(window.api.backupCatalog, chosen);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleRestore = async () => {
    try {
      if (!confirm('La restauration va écraser toutes les données actuelles. Continuer ?')) {
        return;
      }
      const filePath = prompt('Chemin vers le fichier de sauvegarde:');
      if (filePath) {
        await callApi(window.api.restoreCatalog, filePath);
        alert('Restauration effectuée avec succès');
        loadData();
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Erreur lors de la restauration');
    }
  };

  // Build a continuous range of years from min to max, excluding years with 0 artworks
  const yearsRange = useMemo(() => {
    if (!years || years.length === 0) return [] as { year: number; count: number }[];

    // Only include years that actually have artworks (count > 0)
    const filteredYears = years.filter(y => y.count > 0);
    return filteredYears;
  }, [years]);

  return (
    <>
  <aside className="w-64 lg:w-72 h-full bg-neutral-800 border-r border-neutral-700 flex flex-col shadow-xl text-neutral-200">
        {/* Header */}
  <div className="p-4 lg:p-6 border-b border-neutral-700">
          <h1 className="font-bold text-lg lg:text-xl text-neutral-100 flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo Pascal Thouvenin"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold';
                fallback.textContent = 'PT';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            Pascal Thouvenin
          </h1>
        </div>

        {/* New artwork button */}
        <div className="p-4">
          <button
            onClick={onNewArtwork}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus-ring"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">+</span>
              <span>Nouvelle œuvre</span>
            </span>
          </button>
        </div>

        {/* Search & quick filters */}
  <div className="px-4 pb-2 space-y-3 border-b border-neutral-700">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 pl-9 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="absolute left-3 top-2.5 text-neutral-500">🔍</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${showFilters || (filters.noCollection||filters.noType||filters.noPlace||filters.noPigments||filters.noPapers) ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'}`}
            >
              Filtres
              {(filters.noCollection||filters.noType||filters.noPlace||filters.noPigments||filters.noPapers) && (
                <span className="ml-1 bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded-full">
                  {(filters.noCollection?1:0)+(filters.noType?1:0)+(filters.noPlace?1:0)+(filters.noPigments?1:0)+(filters.noPapers?1:0)}
                </span>
              )}
            </button>
            {(query || filters.noCollection || filters.noType || filters.noPlace || filters.noPigments || filters.noPapers) && (
              <button
                onClick={() => { setQuery(''); setFilters({}); }}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-100 border border-neutral-700 rounded-lg hover:bg-neutral-700/60 transition-all duration-200"
              >
                Effacer
              </button>
            )}
          </div>
          {showFilters && (
            <div className="bg-neutral-800/70 border border-neutral-700 rounded-lg p-3 space-y-2">
              <label className="block text-[11px] uppercase tracking-wide text-neutral-500">Afficher seulement sans...</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, noCollection: !filters.noCollection })}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${filters.noCollection ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'}`}
                >Collection</button>
                <button
                  onClick={() => setFilters({ ...filters, noType: !filters.noType })}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${filters.noType ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'}`}
                >Type</button>
                <button
                  onClick={() => setFilters({ ...filters, noPlace: !filters.noPlace })}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${filters.noPlace ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'}`}
                >Lieu</button>
                <button
                  onClick={() => setFilters({ ...filters, noPigments: !filters.noPigments })}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${filters.noPigments ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'}`}
                >Pigments</button>
                <button
                  onClick={() => setFilters({ ...filters, noPapers: !filters.noPapers })}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${filters.noPapers ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60 border border-neutral-700'}`}
                >Papiers</button>
              </div>
            </div>
          )}
          {/* Active filter chips */}
          {(filters.noCollection||filters.noType||filters.noPlace||filters.noPigments||filters.noPapers) && (
            <div className="flex flex-wrap gap-2">
              {filters.noCollection && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] rounded-full border border-orange-500/30">
                  Sans collection
                  <button onClick={() => setFilters({ ...filters, noCollection: false })} className="ml-1 hover:text-orange-300">×</button>
                </span>
              )}
              {filters.noType && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] rounded-full border border-orange-500/30">
                  Sans type
                  <button onClick={() => setFilters({ ...filters, noType: false })} className="ml-1 hover:text-orange-300">×</button>
                </span>
              )}
              {filters.noPlace && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] rounded-full border border-orange-500/30">
                  Sans lieu
                  <button onClick={() => setFilters({ ...filters, noPlace: false })} className="ml-1 hover:text-orange-300">×</button>
                </span>
              )}
              {filters.noPigments && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] rounded-full border border-orange-500/30">
                  Sans pigments
                  <button onClick={() => setFilters({ ...filters, noPigments: false })} className="ml-1 hover:text-orange-300">×</button>
                </span>
              )}
              {filters.noPapers && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] rounded-full border border-orange-500/30">
                  Sans papiers
                  <button onClick={() => setFilters({ ...filters, noPapers: false })} className="ml-1 hover:text-orange-300">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-auto p-2 space-y-1 custom-scrollbar">
          {/* Years */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-neutral-700/60 cursor-pointer flex items-center justify-between font-medium text-neutral-100 transition-colors group"
              onClick={() => toggleSection('years')}
            >
              <span className="flex items-center gap-2">
                <span>Années</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                  {yearsRange.length}
                </span>
              </span>
              <span className="text-xs text-neutral-500 transition-transform duration-200" style={{
                transform: yearsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </div>
            {yearsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {yearsRange.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-neutral-500 italic">Aucune année</div>
                ) : (
                  yearsRange.map(({ year, count }) => {
                    const active = filters.years?.includes(year);
                    return (
                      <div
                        key={year}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
                        }`}
                        onClick={() => toggleYear(year)}
                      >
                        <span>{year}</span>
                        <span className="text-xs opacity-60">{count}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {/* Collections */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-neutral-700/60 cursor-pointer flex items-center justify-between font-medium text-neutral-100 transition-colors group"
              onClick={() => toggleSection('collections')}
            >
              <span className="flex items-center gap-2">
                <span>Collections</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  {collections.length}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('collections');
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 hover:text-blue-300 p-1 rounded transition-all"
                  title="Gérer les collections"
                >
                  ⚙️
                </button>
                <span className="text-xs text-neutral-500 transition-transform duration-200" style={{
                  transform: collectionsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {collectionsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {collections.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-neutral-500 italic">
                    Aucune collection
                  </div>
                ) : (
                  collections
                    .slice()
                    .sort((a,b)=>a.name.localeCompare(b.name))
                    .map(collection => {
                    const isActive = filters.collectionId === collection.id;
                    return (
                      <div
                        key={collection.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
                        }`}
                        onClick={() => onFilterByCollection(collection.id)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate max-w-[120px]">{collection.name}</span>
                          {typeof collection.artwork_count === 'number' && (
                            <span className="text-[10px] opacity-60">{collection.artwork_count}</span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Types */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-neutral-700/60 cursor-pointer flex items-center justify-between font-medium text-neutral-100 transition-colors group"
              onClick={() => toggleSection('types')}
            >
              <span className="flex items-center gap-2">
                <span>Types</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {types.length}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('types');
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-green-400 hover:text-green-300 p-1 rounded transition-all"
                  title="Gérer les types"
                >
                  ⚙️
                </button>
                <span className="text-xs text-neutral-500 transition-transform duration-200" style={{
                  transform: typesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {typesOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {types.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-neutral-500 italic">
                    Aucun type
                  </div>
                ) : (
                  types
                    .slice()
                    .sort((a,b)=>a.name.localeCompare(b.name))
                    .map(type => {
                    const isActive = filters.typeId === type.id;
                    return (
                      <div
                        key={type.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : 'text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
                        }`}
                        onClick={() => onFilterByType(type.id)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate max-w-[120px]">{type.name}</span>
                          {typeof type.artwork_count === 'number' && (
                            <span className="text-[10px] opacity-60">{type.artwork_count}</span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Pigments */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-neutral-700/60 cursor-pointer flex items-center justify-between font-medium text-neutral-100 transition-colors group"
              onClick={() => toggleSection('pigments')}
            >
              <span className="flex items-center gap-2">
                <span>Pigments</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  {pigments.length}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('pigments');
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 p-1 rounded transition-all"
                  title="Gérer les pigments"
                >
                  ⚙️
                </button>
                <span className="text-xs text-neutral-500 transition-transform duration-200" style={{
                  transform: pigmentsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {pigmentsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {pigments.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-neutral-500 italic">
                    Aucun pigment
                  </div>
                ) : (
                  pigments
                    .slice()
                    .sort((a,b)=>a.name.localeCompare(b.name))
                    .map(pigment => {
                    const isActive = filters.pigments?.includes(pigment.id);
                    return (
                      <div
                        key={pigment.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
                        }`}
                        onClick={() => onFilterByPigment(pigment.id)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate max-w-[120px]">{pigment.name}</span>
                          {typeof pigment.artwork_count === 'number' && (
                            <span className="text-[10px] opacity-60">{pigment.artwork_count}</span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Papers */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-neutral-700/60 cursor-pointer flex items-center justify-between font-medium text-neutral-100 transition-colors group"
              onClick={() => toggleSection('papers')}
            >
              <span className="flex items-center gap-2">
                <span>Papiers</span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  {papers.length}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('papers');
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-yellow-400 hover:text-yellow-300 p-1 rounded transition-all"
                  title="Gérer les papiers"
                >
                  ⚙️
                </button>
                <span className="text-xs text-neutral-500 transition-transform duration-200" style={{
                  transform: papersOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {papersOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {papers.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-neutral-500 italic">
                    Aucun papier
                  </div>
                ) : (
                  papers
                    .slice()
                    .sort((a,b)=>a.name.localeCompare(b.name))
                    .map(paper => {
                    const isActive = filters.papers?.includes(paper.id);
                    return (
                      <div
                        key={paper.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : 'text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
                        }`}
                        onClick={() => onFilterByPaper(paper.id)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate max-w-[120px]">{paper.name}</span>
                          {typeof paper.artwork_count === 'number' && (
                            <span className="text-[10px] opacity-60">{paper.artwork_count}</span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Places */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-neutral-700/60 cursor-pointer flex items-center justify-between font-medium text-neutral-100 transition-colors group"
              onClick={() => toggleSection('places')}
            >
              <span className="flex items-center gap-2">
                <span>Lieux</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {places.length}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('places');
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-green-400 hover:text-green-300 p-1 rounded transition-all"
                  title="Gérer les places"
                >
                  ⚙️
                </button>
                <span className="text-xs text-neutral-500 transition-transform duration-200" style={{
                  transform: placesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {placesOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {places.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-neutral-500 italic">
                    Aucun Lieu
                  </div>
                ) : (
                  places
                    .slice()
                    .sort((a,b)=>a.name.localeCompare(b.name))
                    .map(place => {
                    const isActive = filters.placeId === place.id;
                    return (
                      <div
                        key={place.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : 'text-neutral-400 hover:bg-neutral-700/60 hover:text-neutral-100'
                          }`}
                        onClick={() => onFilterByPlace(place.id)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate max-w-[120px]">{place.name}</span>
                          {typeof place.artwork_count === 'number' && (
                            <span className="text-[10px] opacity-60">{place.artwork_count}</span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Footer actions */}
  <div className="p-4 border-t border-neutral-700 space-y-2">
          <div className="space-y-2">
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className={`w-full text-sm py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${isBackingUp ? 'bg-neutral-700/60 text-neutral-500 cursor-default' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/60'}`}
            >
              <span>💾</span>
              <span>{isBackingUp ? 'Sauvegarde en cours...' : 'Sauvegarde'}</span>
            </button>
            {backupProgress && (
              <div className="w-full bg-neutral-700/60 rounded h-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${backupProgress.percent ?? 0}%` }}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleRestore}
            className="w-full text-sm text-neutral-400 hover:text-neutral-100 py-2.5 px-3 hover:bg-neutral-700/60 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <span>📁</span>
            <span>Restauration</span>
          </button>
        </div>
      </aside>

      {showDataManager && (
        <DataManager
          type={showDataManager}
          onClose={handleCloseDataManager}
        />
      )}
    </>
  );
}
