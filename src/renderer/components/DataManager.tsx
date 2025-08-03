import React, { useState, useEffect } from 'react';
import { callApi } from '../hooks/useApi';
import { Collection, Pigment, Paper } from '../types';

interface DataManagerProps {
  type: 'collections' | 'pigments' | 'papers';
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
    papers: 'Papiers'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Gérer les {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Create new item */}
          <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Ajouter un nouveau {type.slice(0, -1)}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Nom"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Description (optionnelle)"
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !newItemName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </form>

          {/* Items list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {title} existants ({items.length})
            </h3>

            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun {type.slice(0, -1)} trouvé
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    {editingItem?.id === item.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                        />
                        <textarea
                          value={editingItem.description || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdate}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                          )}
                          {type === 'collections' && item.date && (
                            <div className="text-xs text-gray-500 mt-1">{item.date}</div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-800 text-sm"
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
    </div>
  );
}
