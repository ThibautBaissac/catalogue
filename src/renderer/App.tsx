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
    <div className="flex h-screen bg-dark-bg text-dark-text-primary">
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <Sidebar onNewArtwork={handleNewArtwork} />
      </div>
      
      {/* Mobile sidebar overlay */}
      <div className="md:hidden fixed inset-0 z-40 flex">
        {/* Mobile sidebar will be implemented here */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with search */}
        <div className="bg-dark-card border-b border-dark-border shadow-sm">
          <div className="p-3 md:p-4">
            <SearchBar />
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Artwork list */}
          <div className="flex-1 p-3 md:p-4 overflow-auto custom-scrollbar">
            <ArtworkList onEdit={handleEditArtwork} />
          </div>
          
          {/* Detail sidebar - Hidden on mobile when not selected */}
          {selectedArtwork && !showEditor && (
            <div className="hidden lg:block">
              <ArtworkDetailSidebar
                artworkId={selectedArtwork.id}
                onClose={clearSelection}
                onEdit={() => handleEditArtwork(selectedArtwork)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile detail overlay */}
      {selectedArtwork && !showEditor && (
        <div className="lg:hidden fixed inset-0 z-50 bg-dark-bg">
          <ArtworkDetailSidebar
            artworkId={selectedArtwork.id}
            onClose={clearSelection}
            onEdit={() => handleEditArtwork(selectedArtwork)}
          />
        </div>
      )}

      {/* Editor modal - Full screen on mobile */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-auto">
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
