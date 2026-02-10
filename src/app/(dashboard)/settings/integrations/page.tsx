"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import { apiKeys } from "@/services/api";
import { toast } from "sonner";
import { Key, Copy, Trash2, Plus, Eye, EyeOff, Code, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function IntegrationsPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [widgetSlug, setWidgetSlug] = useState("");

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const data = await apiKeys.list();
      setKeys(Array.isArray(data) ? data : data.keys || []);
    } catch {
      // No keys yet
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newKeyName.trim()) { toast.error("Indica un nombre para la clave"); return; }
    setCreating(true);
    try {
      const created = await apiKeys.create({ name: newKeyName });
      setKeys(prev => [...prev, created]);
      setNewKeyName("");
      toast.success("Clave API creada. Guárdala, no se mostrará de nuevo.");
      // Show the new key automatically
      if (created.id) setShowKey(prev => ({ ...prev, [created.id]: true }));
    } catch {
      toast.error("Error al crear la clave");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta clave API? Las integraciones que la usen dejarán de funcionar.")) return;
    try {
      await apiKeys.delete(id);
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success("Clave eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const embedCode = widgetSlug
    ? `<iframe src="${window.location.origin}/embed/${widgetSlug}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: 1px solid #e5e7eb;"></iframe>`
    : "";

  return (
    <div className="w-full pb-20">
      <div className="mb-8">
        <Link href="/settings" className="text-primary text-sm hover:underline mb-2 inline-block">
          ← Volver a Ajustes
        </Link>
        <h1 className="text-3xl font-bold text-primary">Integraciones & API</h1>
        <p className="text-[var(--color-foreground)] opacity-60">
          Gestiona tus claves API y configura el widget embebible de reservas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <Card className="border-beige">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={20} className="text-primary" />
              Claves API
            </CardTitle>
          </CardHeader>
          <div className="p-6">
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              Usa claves API para integrar tu sistema de reservas con otras aplicaciones.
            </p>

            {loading ? (
              <p className="text-sm text-[var(--color-muted-foreground)] text-center py-4">Cargando...</p>
            ) : (
              <>
                {keys.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {keys.map(key => (
                      <div key={key.id} className="flex items-center justify-between p-3 border border-beige rounded-lg bg-[var(--color-light)]/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-foreground)]">{key.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-[var(--color-light)] px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                              {showKey[key.id] ? (key.key || key.api_key || "••••••••") : "••••••••••••••••"}
                            </code>
                            <button onClick={() => setShowKey(p => ({ ...p, [key.id]: !p[key.id] }))} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                              {showKey[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => copyToClipboard(key.key || key.api_key || "")} className="text-[var(--color-muted-foreground)] hover:text-primary">
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(key.id)} className="text-red-400 hover:text-red-600 ml-3">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {keys.length === 0 && (
                  <p className="text-sm text-[var(--color-muted-foreground)] italic text-center py-4">No hay claves API</p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="Nombre de la clave"
                    className="flex-1 px-3 py-2 border border-beige rounded-lg text-sm"
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                  />
                  <Button type="button" loading={creating} onClick={handleCreate}>
                    <Plus size={16} className="mr-1" />
                    Crear
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Embeddable Widget */}
        <Card className="border-beige">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} className="text-primary" />
              Widget Embebible
            </CardTitle>
          </CardHeader>
          <div className="p-6">
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              Inserta un widget de reservas directamente en tu página web.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Slug de tu organización</label>
                <input
                  type="text"
                  value={widgetSlug}
                  onChange={e => setWidgetSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="mi-escape-room"
                  className="w-full px-3 py-2 border border-beige rounded-lg text-sm"
                />
              </div>

              {embedCode && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Código para insertar</label>
                    <div className="relative">
                      <pre className="bg-[var(--color-light)] p-3 rounded-lg text-xs font-mono overflow-x-auto border border-beige whitespace-pre-wrap break-all">
                        {embedCode}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(embedCode)}
                        className="absolute top-2 right-2 p-1.5 bg-[var(--color-background)] border border-beige rounded-md text-[var(--color-muted-foreground)] hover:text-primary"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-muted-foreground)]">Vista previa</label>
                    <div className="border border-beige rounded-lg p-4 bg-[var(--color-light)]/20 text-center">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center text-sm text-[var(--color-muted-foreground)]">
                        <div className="text-center">
                          <ExternalLink size={24} className="mx-auto mb-2 text-primary" />
                          <p>Widget de reservas se mostrará aquí</p>
                          <a href={`/embed/${widgetSlug}`} target="_blank" className="text-primary text-xs hover:underline mt-1 inline-block">
                            Ver en nueva pestaña →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
