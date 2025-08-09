import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ArtworkList from './features/artworks/ArtworkList';
import ArtworkDetailSidebar from './components/ArtworkDetailSidebar';
import ArtworkEditor from './components/ArtworkEditor';
import ArtworkViewer from './components/ArtworkViewer';
import { useCatalogStore } from './store/catalogStore';

function App() {
  const { selectedArtwork, clearSelection, setFilters, filters } = useCatalogStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewingArtwork, setViewingArtwork] = useState<any>(null);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleNewArtwork = () => {
    setEditingArtwork(null);
    setShowEditor(true);
  };

  const handleEditArtwork = (artwork: any) => {
    setEditingArtwork(artwork);
    setShowEditor(true);
  };

  const handleViewArtwork = (artwork: any, imageIndex: number = 0) => {
    setViewingArtwork(artwork);
    setViewerImageIndex(imageIndex);
    setShowViewer(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingArtwork(null);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setViewingArtwork(null);
    setViewerImageIndex(0);
  };

  const handleArtworkSaved = () => {
    setShowEditor(false);
    setEditingArtwork(null);
    // Trigger refresh of artwork list
    window.dispatchEvent(new CustomEvent('artwork-updated'));
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleFilterByCollection = (collectionId: number) => {
    // Toggle: if already filtered by this collection, clear the filter
    if (filters.collectionId === collectionId) {
      setFilters({ ...filters, collectionId: undefined });
    } else {
      setFilters({ ...filters, collectionId });
    }
  };

  const handleFilterByType = (typeId: number) => {
    // Toggle: if already filtered by this type, clear the filter
    if (filters.typeId === typeId) {
      setFilters({ ...filters, typeId: undefined });
    } else {
      setFilters({ ...filters, typeId });
    }
  };

  const handleFilterByPigment = (pigmentId: number) => {
    // Toggle: if already filtered by this pigment, remove it, otherwise set it
    const currentPigments = filters.pigments || [];
    if (currentPigments.includes(pigmentId)) {
      const newPigments = currentPigments.filter(id => id !== pigmentId);
      setFilters({ ...filters, pigments: newPigments.length > 0 ? newPigments : undefined });
    } else {
      setFilters({ ...filters, pigments: [pigmentId] });
    }
  };

  const handleFilterByPaper = (paperId: number) => {
    // Toggle: if already filtered by this paper, remove it, otherwise set it
    const currentPapers = filters.papers || [];
    if (currentPapers.includes(paperId)) {
      const newPapers = currentPapers.filter(id => id !== paperId);
      setFilters({ ...filters, papers: newPapers.length > 0 ? newPapers : undefined });
    } else {
      setFilters({ ...filters, papers: [paperId] });
    }
  };

  const handleFilterByPlace = (placeId: number) => {
    // Toggle: if already filtered by this place, clear the filter
    if (filters.placeId === placeId) {
      setFilters({ ...filters, placeId: undefined });
    } else {
      setFilters({ ...filters, placeId });
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text-primary">
      {/* Sidebar - Always visible with toggle */}
      <div className={`${sidebarVisible ? 'block' : 'hidden'} h-full transition-all duration-300`}>
        <Sidebar
          onNewArtwork={handleNewArtwork}
          onFilterByCollection={handleFilterByCollection}
          onFilterByType={handleFilterByType}
          onFilterByPigment={handleFilterByPigment}
          onFilterByPaper={handleFilterByPaper}
          onFilterByPlace={handleFilterByPlace}
        />
      </div>

      {/* Main content (header removed, toggle moved into list) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex overflow-hidden">
          {/* Artwork list */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <ArtworkList onEdit={handleEditArtwork} onView={handleViewArtwork} onToggleSidebar={toggleSidebar} sidebarVisible={sidebarVisible} />
          </div>

          {/* Detail sidebar - Hidden on mobile when not selected */}
          {selectedArtwork && !showEditor && (
            <div className="hidden lg:block">
              <ArtworkDetailSidebar
                artworkId={selectedArtwork.id}
                onClose={clearSelection}
                onEdit={() => handleEditArtwork(selectedArtwork)}
                onViewArtwork={handleViewArtwork}
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
            onViewArtwork={handleViewArtwork}
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

  {/* Artwork viewer modal */}
      {showViewer && viewingArtwork && (
        <ArtworkViewer
          artwork={viewingArtwork}
          onClose={handleCloseViewer}
          onEdit={() => {
            handleCloseViewer();
            handleEditArtwork(viewingArtwork);
          }}
          initialImageIndex={viewerImageIndex}
        />
      )}
    </div>
  );
}

export default App;
