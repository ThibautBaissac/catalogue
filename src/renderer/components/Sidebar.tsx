import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r flex flex-col">
      <div className="p-4 font-bold border-b">Catalogue</div>
      <nav className="flex-1 overflow-auto p-2 space-y-2">
        <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Collections</div>
        <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Pigments</div>
        <div className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Papiers</div>
      </nav>
    </aside>
  );
}
