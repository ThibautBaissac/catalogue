import React, { useState, useEffect } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper, Type, Place } from '../../shared/types';

interface DataManagerProps {
  type: 'collections' | 'pigments' | 'papers' | 'types' | 'places';
  onClose: () => void;
}

export default function DataManager({ type, onClose }: DataManagerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const title = {
    collections: 'Collections',
    pigments: 'Pigments',
    papers: 'Papiers',
    types: 'Types',
    places: 'Places'
  }[type];

  const apiMethods = {
    collections: {
      list: window.api.listCollections,
      create: window.api.createCollection,
      update: window.api.updateCollection,
      delete: window.api.deleteCollection
    },
    pigments: {
      list: window.api.listPigments,
      create: window.api.createPigment,
      update: window.api.updatePigment,
      delete: window.api.deletePigment
    },
    papers: {
      list: window.api.listPapers,
      create: window.api.createPaper,
      update: window.api.updatePaper,
      delete: window.api.deletePaper
    },
    types: {
      list: window.api.listTypes,
      create: window.api.createType,
      update: window.api.updateType,
      delete: window.api.deleteType
    },
    places: {
      list: window.api.listPlaces,
      create: window.api.createPlace,
      update: window.api.updatePlace,
      delete: window.api.deletePlace
    }
  }[type];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await callApi(apiMethods.list);
      setItems(data);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setLoading(true);
    try {
      const data: any = {
        name: newItemName.trim(),
        description: newItemDescription.trim() || null
      };

      if (type === 'collections') {
        data.date = new Date().toISOString().split('T')[0];
      }

      await callApi(apiMethods.create, data);
      setNewItemName('');
      setNewItemDescription('');
      loadItems();
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
  };

  const handleUpdate = async () => {
    if (!editingItem?.name.trim()) return;

    setLoading(true);
    try {
      await callApi(apiMethods.update, {
        id: editingItem.id,
        updates: {
          name: editingItem.name.trim(),
          description: editingItem.description?.trim() || null
        }
      });
      setEditingItem(null);
      loadItems();
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;

    setLoading(true);
    try {
      await callApi(apiMethods.delete, item.id);
      loadItems();
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-neutral-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-neutral-700">
        {/* Header */}
  <div className="p-6 border-b border-neutral-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
              <span className="text-2xl">
                {type === 'collections' ? '📚' : type === 'pigments' ? '🎨' : '📄'}
              </span>
              Gérer les {title}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-100 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-700/60 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-6">
            {/* Create new item */}
            <form onSubmit={handleCreate} className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
              <h3 className="text-sm font-medium text-neutral-100 mb-3 flex items-center gap-2">
                <span>✨</span>
                Ajouter un nouveau {type.slice(0, -1)}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nom"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Description (optionnelle)"
                  rows={2}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={loading || !newItemName.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>

            {/* Items list */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-100 mb-3 flex items-center gap-2">
                <span>📋</span>
                {title} existants ({items.length})
              </h3>

              {loading ? (
                <div className="text-center text-neutral-500 py-8">
                  <div className="animate-pulse">Chargement...</div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center text-neutral-500 py-8 bg-neutral-900 rounded-lg border border-neutral-700">
                  <div className="text-4xl mb-2 opacity-50">
                    {type === 'collections' ? '📚' : type === 'pigments' ? '🎨' : '📄'}
                  </div>
                  <div>Aucun {type.slice(0, -1)} trouvé</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors">
                      {editingItem?.id === item.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                          <textarea
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            rows={2}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdate}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              ✓ Sauvegarder
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              ✕ Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-neutral-100">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-neutral-400 mt-1">{item.description}</div>
                            )}
                            {type === 'collections' && item.date && (
                              <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                📅 {item.date}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-500/20 transition-all duration-200 flex items-center gap-1"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-all duration-200 flex items-center gap-1"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
  <div className="p-4 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="w-full bg-neutral-700/60 hover:bg-neutral-600 text-neutral-100 py-2 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
