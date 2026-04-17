"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import { integrationCalendars, CreateIntegrationCalendarData } from "@/services/api";
import { toast } from "sonner";
import { Calendar, Plus, Copy, ExternalLink, Trash2, Edit2, Key, Eye, Code } from "lucide-react";

export default function CalendarsListPage() {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [embedCodes, setEmbedCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCalendars();
  }, []);

  async function loadCalendars() {
    try {
      const data = await integrationCalendars.list();
      setCalendars(data.calendars || []);
    } catch (error) {
      console.error("Error loading calendars:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Indica un nombre para el calendario");
      return;
    }
    if (!newSlug.trim()) {
      toast.error("Indica un slug (URL) para el calendario");
      return;
    }

    setCreating(true);
    try {
      const data: CreateIntegrationCalendarData = {
        name: newName,
        slug: newSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
        flow_type: "room_first",
      };
      const created = await integrationCalendars.create(data);
      setCalendars((prev) => [...prev, created]);
      setNewName("");
      setNewSlug("");
      toast.success("Calendario creado");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Error al crear el calendario");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este calendario? Las webs que lo usen dejará de mostrarlo.")) return;
    try {
      await integrationCalendars.delete(id);
      setCalendars((prev) => prev.filter((c) => c.id !== id));
      toast.success("Calendario eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const loadEmbedCode = async (id: string) => {
    try {
      const data = await integrationCalendars.getEmbedCode(id);
      setEmbedCodes((prev) => ({ ...prev, [id]: data.iframe_code || "" }));
    } catch {
      toast.error("Error al obtener código embed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="w-full pb-20">
      <div className="mb-8">
        <Link
          href="/settings/integrations"
          className="text-primary text-sm hover:underline mb-2 inline-block"
        >
          ← Volver a Integraciones
        </Link>
        <h1 className="text-3xl font-bold text-primary">Calendarios de Reserva</h1>
        <p className="text-[var(--color-foreground)] opacity-60">
          Crea calendarios de reserva para insertar en las webs de tus clientes.
        </p>
      </div>

      {/* Create New Calendar */}
      <Card className="border-beige mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            Crear Nuevo Calendario
          </CardTitle>
        </CardHeader>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Reserva Sala Escape Premium"
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                placeholder="ej: sala-premium"
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creando..." : "Crear"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendars List */}
      {loading ? (
        <p className="text-center py-8 text-[var(--color-muted-foreground)]">
          Cargando...
        </p>
      ) : calendars.length === 0 ? (
        <Card className="border-beige">
          <div className="p-8 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-[var(--color-muted-foreground)] opacity-40" />
            <p className="text-[var(--color-muted-foreground)]">
              No tienes calendarios de integración todavía.
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)] opacity-70 mt-1">
              Crea uno arriba para empezar a insertarlo en tu web.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {calendars.map((calendar) => (
            <Card key={calendar.id} className="border-beige">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar size={20} className="text-primary" />
                      {calendar.name}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      {calendar.slug} •{" "}
                      {calendar.flow_type === "room_first" ? "Sala primero" : "Fecha primero"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/settings/integrations/calendars/${calendar.id}`}>
                      <Button variant="secondary" size="sm">
                        <Edit2 size={14} />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadEmbedCode(calendar.id)}
                    >
                      <Code size={14} />
                      Embed
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(calendar.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Estado: </span>
                    <span
                      className={
                        calendar.is_active
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {calendar.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Visibilidad: </span>
                    <span className="font-medium">
                      {calendar.is_public ? "Público" : "Privado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Modo: </span>
                    <span className="font-medium">
                      {calendar.read_only ? "Solo lectura" : "Con reservas"}
                    </span>
                  </div>
                  {calendar.has_api_key && (
                    <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                      <Key size={14} />
                      <span>API key configurada</span>
                    </div>
                  )}
                </div>

                {/* Embed Code Preview */}
                {embedCodes[calendar.id] && (
                  <div className="mt-4 p-4 bg-[var(--color-muted)] rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Código para insertar:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(embedCodes[calendar.id])}
                      >
                        <Copy size={14} className="mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                      {embedCodes[calendar.id]}
                    </pre>
                    <div className="mt-2 flex gap-4 text-sm">
                      <a
                        href={`/embed/calendar/${calendar.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Vista previa
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
