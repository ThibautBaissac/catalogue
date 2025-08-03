import React, { useState, useEffect } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper } from '../types';
import DataManager from './DataManager';

interface SidebarProps {
  onNewArtwork: () => void;
}

export default function Sidebar({ onNewArtwork }: SidebarProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pigments, setPigments] = useState<Pigment[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showDataManager, setShowDataManager] = useState<'collections' | 'pigments' | 'papers' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [colls, pigs, paps] = await Promise.all([
        callApi(window.api.listCollections),
        callApi(window.api.listPigments),
        callApi(window.api.listPapers)
      ]);
      setCollections(colls);
      setPigments(pigs);
      setPapers(paps);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    }
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const handleManageData = (type: 'collections' | 'pigments' | 'papers') => {
    setShowDataManager(type);
  };

  const handleCloseDataManager = () => {
    setShowDataManager(null);
    loadData(); // Refresh data after closing manager
  };

  const handleBackup = async () => {
    try {
      // Note: In a real Electron app, you would use dialog.showSaveDialog
      // For now, we'll use a fixed path as an example
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
      // Note: In a real app, you would use dialog.showOpenDialog
      const filePath = prompt('Chemin vers le fichier de sauvegarde:');
      if (filePath) {
        await callApi(window.api.restoreCatalog, filePath);
        alert('Restauration effectuée avec succès');
        loadData(); // Reload sidebar data
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Erreur lors de la restauration');
    }
  };

  return (
    <>
      <aside className="w-60 bg-white border-r flex flex-col">
        <div className="p-4 font-bold border-b text-gray-800">
          Catalogue Raisonné
        </div>

        <div className="p-4">
          <button
            onClick={onNewArtwork}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Nouvelle œuvre
          </button>
        </div>

        <nav className="flex-1 overflow-auto p-2 space-y-2">
          {/* Collections */}
          <div>
            <div
              className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-between font-medium text-gray-700"
              onClick={() => toggleSection('collections')}
            >
              <span>Collections ({collections.length})</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('collections');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Gérer les collections"
                >
                  ⚙️
                </button>
                <span className="text-xs">{activeSection === 'collections' ? '−' : '+'}</span>
              </div>
            </div>
            {activeSection === 'collections' && (
              <div className="ml-4 space-y-1">
                {collections.map(collection => (
                  <div key={collection.id} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer rounded">
                    {collection.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pigments */}
          <div>
            <div
              className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-between font-medium text-gray-700"
              onClick={() => toggleSection('pigments')}
            >
              <span>Pigments ({pigments.length})</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('pigments');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Gérer les pigments"
                >
                  ⚙️
                </button>
                <span className="text-xs">{activeSection === 'pigments' ? '−' : '+'}</span>
              </div>
            </div>
            {activeSection === 'pigments' && (
              <div className="ml-4 space-y-1">
                {pigments.map(pigment => (
                  <div key={pigment.id} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer rounded">
                    {pigment.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Papers */}
          <div>
            <div
              className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-between font-medium text-gray-700"
              onClick={() => toggleSection('papers')}
            >
              <span>Papiers ({papers.length})</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageData('papers');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Gérer les papiers"
                >
                  ⚙️
                </button>
                <span className="text-xs">{activeSection === 'papers' ? '−' : '+'}</span>
              </div>
            </div>
            {activeSection === 'papers' && (
              <div className="ml-4 space-y-1">
                {papers.map(paper => (
                  <div key={paper.id} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer rounded">
                    {paper.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t space-y-2">
          <button
            onClick={handleBackup}
            className="w-full text-sm text-gray-600 hover:text-gray-800 py-1 hover:bg-gray-50 rounded transition-colors"
          >
            💾 Sauvegarde
          </button>
          <button
            onClick={handleRestore}
            className="w-full text-sm text-gray-600 hover:text-gray-800 py-1 hover:bg-gray-50 rounded transition-colors"
          >
            📁 Restauration
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
