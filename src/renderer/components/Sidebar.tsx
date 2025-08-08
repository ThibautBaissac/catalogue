import React, { useState, useEffect, useMemo } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper, Type, Place } from '@shared/types';
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [pigments, setPigments] = useState<Pigment[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [years, setYears] = useState<{ year: number; count: number }[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState<boolean>(false);
  const [typesOpen, setTypesOpen] = useState<boolean>(false);
  const [placesOpen, setPlacesOpen] = useState<boolean>(false);
  const [pigmentsOpen, setPigmentsOpen] = useState<boolean>(false);
  const [papersOpen, setPapersOpen] = useState<boolean>(false);
  const [yearsOpen, setYearsOpen] = useState<boolean>(false);
  const [showDataManager, setShowDataManager] = useState<'collections' | 'types' | 'pigments' | 'papers' | 'places' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [colls, typs, pigs, paps, placs, yrs] = await Promise.all([
        callApi(window.api.listCollections),
        callApi(window.api.listTypes),
        callApi(window.api.listPigments),
        callApi(window.api.listPapers),
        callApi(window.api.listPlaces),
        callApi(window.api.listYears)
      ]);

      // Sort alphabetically by name
      setCollections(colls.sort((a: Collection, b: Collection) => a.name.localeCompare(b.name)));
      setTypes(typs.sort((a: Type, b: Type) => a.name.localeCompare(b.name)));
      setPlaces(placs.sort((a: Place, b: Place) => a.name.localeCompare(b.name)));
      setPigments(pigs.sort((a: Pigment, b: Pigment) => a.name.localeCompare(b.name)));
      setPapers(paps.sort((a: Paper, b: Paper) => a.name.localeCompare(b.name)));
      setYears(yrs);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    }
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

  const handleCloseDataManager = () => {
    setShowDataManager(null);
    loadData();
  };

  const handleBackup = async () => {
    try {
      const userPath = `/Users/${process.env.USER || 'user'}/Desktop/catalogue-backup-${new Date().toISOString().split('T')[0]}.zip`;
      await callApi(window.api.backupCatalog, userPath);
      alert(`Sauvegarde créée : ${userPath}`);
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
      <aside className="w-64 lg:w-72 h-full bg-dark-card border-r border-dark-border flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-dark-border">
          <h1 className="font-bold text-lg lg:text-xl text-dark-text-primary flex items-center gap-3">
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

        {/* Navigation sections */}
        <nav className="flex-1 overflow-auto p-2 space-y-1 custom-scrollbar">
          {/* Years */}
          <div className="mb-2">
            <div
              className="px-3 py-2.5 rounded-lg hover:bg-dark-hover cursor-pointer flex items-center justify-between font-medium text-dark-text-primary transition-colors group"
              onClick={() => toggleSection('years')}
            >
              <span className="flex items-center gap-2">
                <span>Années</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                  {yearsRange.length}
                </span>
              </span>
              <span className="text-xs text-dark-text-muted transition-transform duration-200" style={{
                transform: yearsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </div>
            {yearsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {yearsRange.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-dark-text-muted italic">Aucune année</div>
                ) : (
                  yearsRange.map(({ year, count }) => {
                    const active = filters.years?.includes(year);
                    return (
                      <div
                        key={year}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
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
              className="px-3 py-2.5 rounded-lg hover:bg-dark-hover cursor-pointer flex items-center justify-between font-medium text-dark-text-primary transition-colors group"
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
                <span className="text-xs text-dark-text-muted transition-transform duration-200" style={{
                  transform: collectionsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {collectionsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {collections.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-dark-text-muted italic">
                    Aucune collection
                  </div>
                ) : (
                  collections.map(collection => {
                    const isActive = filters.collectionId === collection.id;
                    return (
                      <div
                        key={collection.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
                        }`}
                        onClick={() => onFilterByCollection(collection.id)}
                      >
                        {collection.name}
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
              className="px-3 py-2.5 rounded-lg hover:bg-dark-hover cursor-pointer flex items-center justify-between font-medium text-dark-text-primary transition-colors group"
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
                <span className="text-xs text-dark-text-muted transition-transform duration-200" style={{
                  transform: typesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {typesOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {types.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-dark-text-muted italic">
                    Aucun type
                  </div>
                ) : (
                  types.map(type => {
                    const isActive = filters.typeId === type.id;
                    return (
                      <div
                        key={type.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
                        }`}
                        onClick={() => onFilterByType(type.id)}
                      >
                        {type.name}
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
              className="px-3 py-2.5 rounded-lg hover:bg-dark-hover cursor-pointer flex items-center justify-between font-medium text-dark-text-primary transition-colors group"
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
                <span className="text-xs text-dark-text-muted transition-transform duration-200" style={{
                  transform: pigmentsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {pigmentsOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {pigments.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-dark-text-muted italic">
                    Aucun pigment
                  </div>
                ) : (
                  pigments.map(pigment => {
                    const isActive = filters.pigments?.includes(pigment.id);
                    return (
                      <div
                        key={pigment.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
                        }`}
                        onClick={() => onFilterByPigment(pigment.id)}
                      >
                        {pigment.name}
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
              className="px-3 py-2.5 rounded-lg hover:bg-dark-hover cursor-pointer flex items-center justify-between font-medium text-dark-text-primary transition-colors group"
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
                <span className="text-xs text-dark-text-muted transition-transform duration-200" style={{
                  transform: papersOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {papersOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {papers.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-dark-text-muted italic">
                    Aucun papier
                  </div>
                ) : (
                  papers.map(paper => {
                    const isActive = filters.papers?.includes(paper.id);
                    return (
                      <div
                        key={paper.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${
                          isActive
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
                        }`}
                        onClick={() => onFilterByPaper(paper.id)}
                      >
                        {paper.name}
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
              className="px-3 py-2.5 rounded-lg hover:bg-dark-hover cursor-pointer flex items-center justify-between font-medium text-dark-text-primary transition-colors group"
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
                <span className="text-xs text-dark-text-muted transition-transform duration-200" style={{
                  transform: placesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            </div>
            {placesOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {places.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-dark-text-muted italic">
                    Aucun Lieu
                  </div>
                ) : (
                  places.map(place => {
                    const isActive = filters.placeId === place.id;
                    return (
                      <div
                        key={place.id}
                        className={`px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : 'text-dark-text-secondary hover:bg-dark-hover hover:text-dark-text-primary'
                          }`}
                        onClick={() => onFilterByPlace(place.id)}
                      >
                        {place.name}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-dark-border space-y-2">
          <button
            onClick={handleBackup}
            className="w-full text-sm text-dark-text-secondary hover:text-dark-text-primary py-2.5 px-3 hover:bg-dark-hover rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <span>💾</span>
            <span>Sauvegarde</span>
          </button>
          <button
            onClick={handleRestore}
            className="w-full text-sm text-dark-text-secondary hover:text-dark-text-primary py-2.5 px-3 hover:bg-dark-hover rounded-lg transition-all duration-200 flex items-center gap-2"
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
