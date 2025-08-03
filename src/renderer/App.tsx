import React from 'react';
import Sidebar from './components/Sidebar';
import ArtworkList from './features/artworks/ArtworkList';
import SearchBar from './features/search/SearchBar';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <SearchBar />
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <ArtworkList />
        </div>
      </div>
    </div>
  );
}

export default App;
