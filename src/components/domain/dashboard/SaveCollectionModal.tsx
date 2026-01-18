"use client";

import React, { useState, useEffect } from "react";
import { X, Save, FolderPlus, Trash2, Check } from "lucide-react";
import Button from "@/components/Button";
import { WidgetConfig, WidgetType } from "./types";
import { widgets as dashboardService, type UserWidgetCollection } from "@/services/api";

interface SaveCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLayout: WidgetConfig[];
  onLoadCollection: (layout: WidgetConfig[]) => void;
}

export function SaveCollectionModal({
  isOpen,
  onClose,
  currentLayout,
  onLoadCollection,
}: SaveCollectionModalProps) {
  const [collections, setCollections] = useState<UserWidgetCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === "object" && "response" in err) {
      const response = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
      if (response?.status === 401) {
        return "Debes iniciar sesión para guardar colecciones";
      }
      if (response?.data?.detail) {
        return response.data.detail;
      }
    }
    return "Error desconocido";
  };

  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getCollections();
      setCollections(data);
    } catch (err) {
      console.error("Failed to load collections", err);
      const msg = getErrorMessage(err);
      if (msg.includes("sesión")) {
        setError(msg);
      } else {
        setError("No se pudieron cargar las colecciones. " + msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNew = async () => {
    if (!newName.trim()) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const newCollection = await dashboardService.createCollection({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        layout: currentLayout.map((w) => ({
          id: w.id,
          type: w.type,
          colSpan: w.colSpan || 48,
          rowSpan: w.rowSpan || 8,
          config: w.config as Record<string, unknown> | undefined,
        })),
      });
      setCollections([...collections, newCollection]);
      setShowNewForm(false);
      setNewName("");
      setNewDescription("");
    } catch (err) {
      console.error("Failed to save collection", err);
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCollection = async (collection: UserWidgetCollection) => {
    setIsSaving(true);
    try {
      await dashboardService.updateCollection(collection.id, {
        layout: currentLayout.map((w) => ({
          id: w.id,
          type: w.type,
          colSpan: w.colSpan || 48,
          rowSpan: w.rowSpan || 8,
          config: w.config as Record<string, unknown> | undefined,
        })),
      });
      loadCollections();
    } catch (err) {
      console.error("Failed to update collection", err);
      setError("Error al actualizar la colección");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta colección?")) return;
    
    try {
      await dashboardService.deleteCollection(collectionId);
      setCollections(collections.filter((c) => c.id !== collectionId));
    } catch (err) {
      console.error("Failed to delete collection", err);
      setError("Error al eliminar la colección");
    }
  };

  const handleLoadCollection = (collection: UserWidgetCollection) => {
    const layout = collection.layout.map((item) => ({
      id: item.id,
      type: item.type as WidgetType,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
      config: item.config,
    }));
    onLoadCollection(layout);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-background)] rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">Mis Colecciones</h3>
              <p className="text-sm text-secondary">Guarda y carga layouts personalizados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-[var(--color-foreground)] p-1 rounded-lg hover:bg-beige"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-secondary">Cargando...</div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-3 border border-[var(--color-beige)] rounded-lg hover:bg-beige transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--color-foreground)]">{collection.name}</span>
                      {collection.is_active && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          Activa
                        </span>
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-xs text-secondary mt-1">{collection.description}</p>
                    )}
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                      {collection.layout.length} widgets
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLoadCollection(collection)}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg"
                      title="Cargar colección"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateCollection(collection)}
                      className="p-2 hover:bg-green-50 text-green-500 rounded-lg"
                      title="Actualizar con layout actual"
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {collections.length === 0 && !showNewForm && (
                <div className="text-center py-8 text-secondary">
                  No tienes colecciones guardadas
                </div>
              )}
            </div>
          )}
        </div>

        {showNewForm ? (
          <div className="mt-4 pt-4 border-t border-[var(--color-beige)] space-y-3">
            <input
              type="text"
              placeholder="Nombre de la colección"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg text-sm focus:border-primary focus:outline-none"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg text-sm focus:border-primary focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewForm(false);
                  setNewName("");
                  setNewDescription("");
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNew}
                disabled={!newName.trim() || isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-[var(--color-beige)]">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowNewForm(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Guardar Layout Actual
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
