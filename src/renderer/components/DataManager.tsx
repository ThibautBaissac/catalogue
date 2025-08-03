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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-dark-border">
        {/* Header */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-dark-text-primary flex items-center gap-2">
              <span className="text-2xl">
                {type === 'collections' ? '📚' : type === 'pigments' ? '🎨' : '📄'}
              </span>
              Gérer les {title}
            </h2>
            <button
              onClick={onClose}
              className="text-dark-text-muted hover:text-dark-text-primary text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-hover transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-6">
            {/* Create new item */}
            <form onSubmit={handleCreate} className="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
              <h3 className="text-sm font-medium text-dark-text-primary mb-3 flex items-center gap-2">
                <span>✨</span>
                Ajouter un nouveau {type.slice(0, -1)}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nom"
                  className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Description (optionnelle)"
                  rows={2}
                  className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
              <h3 className="text-sm font-medium text-dark-text-primary mb-3 flex items-center gap-2">
                <span>📋</span>
                {title} existants ({items.length})
              </h3>

              {loading ? (
                <div className="text-center text-dark-text-muted py-8">
                  <div className="animate-pulse">Chargement...</div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center text-dark-text-muted py-8 bg-dark-bg rounded-lg border border-dark-border">
                  <div className="text-4xl mb-2 opacity-50">
                    {type === 'collections' ? '📚' : type === 'pigments' ? '🎨' : '📄'}
                  </div>
                  <div>Aucun {type.slice(0, -1)} trouvé</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="bg-dark-bg border border-dark-border rounded-lg p-4 hover:border-dark-border-light transition-colors">
                      {editingItem?.id === item.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                          <textarea
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            rows={2}
                            className="w-full bg-dark-card border border-dark-border rounded-md px-3 py-2 text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
                            <div className="font-medium text-dark-text-primary">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-dark-text-secondary mt-1">{item.description}</div>
                            )}
                            {type === 'collections' && item.date && (
                              <div className="text-xs text-dark-text-muted mt-1 flex items-center gap-1">
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
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={onClose}
            className="w-full bg-dark-hover hover:bg-dark-border text-dark-text-primary py-2 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
