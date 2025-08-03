import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ArtworkList from './features/artworks/ArtworkList';
import SearchBar from './features/search/SearchBar';
import ArtworkDetailSidebar from './components/ArtworkDetailSidebar';
import ArtworkEditor from './components/ArtworkEditor';
import { useCatalogStore } from './store/catalogStore';

function App() {
  const { selectedArtwork, clearSelection } = useCatalogStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);

  const handleNewArtwork = () => {
    setEditingArtwork(null);
    setShowEditor(true);
  };

  const handleEditArtwork = (artwork: any) => {
    setEditingArtwork(artwork);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingArtwork(null);
  };

  const handleArtworkSaved = () => {
    setShowEditor(false);
    setEditingArtwork(null);
    // Trigger refresh of artwork list
    window.dispatchEvent(new CustomEvent('artwork-updated'));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onNewArtwork={handleNewArtwork} />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white">
          <SearchBar />
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <ArtworkList onEdit={handleEditArtwork} />
        </div>
      </div>

      {selectedArtwork && !showEditor && (
        <ArtworkDetailSidebar
          artworkId={selectedArtwork.id}
          onClose={clearSelection}
          onEdit={() => handleEditArtwork(selectedArtwork)}
        />
      )}

      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <ArtworkEditor
              initial={editingArtwork}
              onSaved={handleArtworkSaved}
              onCancel={handleCloseEditor}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
