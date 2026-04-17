"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import {
  integrationCalendars,
  rooms,
  UpdateIntegrationCalendarData,
  CreateCustomFieldData,
} from "@/services/api";
import { toast } from "sonner";
import {
  Calendar,
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  GripVertical,
  Key,
  Copy,
  Eye,
  ExternalLink,
  Code,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CalendarEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [calendar, setCalendar] = useState<any>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [embedCode, setEmbedCode] = useState<string>("");
  const [showEmbed, setShowEmbed] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [flowType, setFlowType] = useState<"room_first" | "date_first">("room_first");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [allRooms, setAllRooms] = useState(true);
  const [timezone, setTimezone] = useState("Europe/Madrid");
  const [slotDuration, setSlotDuration] = useState(60);
  const [slotInterval, setSlotInterval] = useState(15);
  const [advanceBookingHours, setAdvanceBookingHours] = useState(2);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(60);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(12);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  // Custom fields
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [showNewField, setShowNewField] = useState(false);
  const [newField, setNewField] = useState<CreateCustomFieldData>({
    field_key: "",
    field_label: "",
    field_type: "text",
    is_required: false,
  });

  useEffect(() => {
    loadRooms();
    if (!isNew) {
      loadCalendar(id);
    }
  }, [id]);

  async function loadRooms() {
    try {
      const data = await rooms.list();
      setAvailableRooms(data.rooms || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  }

  async function loadCalendar(calendarId: string) {
    try {
      const data = await integrationCalendars.get(calendarId);
      setCalendar(data);

      // Populate form
      setName(data.name || "");
      setSlug(data.slug || "");
      setDescription(data.description || "");
      setFlowType(data.flow_type || "room_first");
      setSelectedRooms(data.room_ids || []);
      setAllRooms(!data.room_ids || data.room_ids.length === 0);
      setTimezone(data.timezone || "Europe/Madrid");
      setSlotDuration(data.slot_duration_minutes || 60);
      setSlotInterval(data.slot_interval_minutes || 15);
      setAdvanceBookingHours(data.advance_booking_hours || 2);
      setMaxAdvanceDays(data.max_advance_days || 60);
      setPrimaryColor(data.primary_color || "#6366f1");
      setBackgroundColor(data.background_color || "#ffffff");
      setBorderRadius(data.border_radius || 12);
      setShowAvailableOnly(data.show_available_only ?? true);
      setReadOnly(data.read_only ?? false);
      setIsActive(data.is_active ?? true);
      setIsPublic(data.is_public ?? true);

      // Load custom fields
      try {
        const fieldsData = await integrationCalendars.getFields(calendarId);
        setCustomFields(fieldsData.fields || []);
      } catch {
        // No fields yet
      }
    } catch (error) {
      toast.error("Error al cargar el calendario");
      router.push("/settings/integrations/calendars");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!slug.trim()) {
      toast.error("El slug es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const data: UpdateIntegrationCalendarData = {
        name,
        slug,
        description,
        flow_type: flowType,
        room_ids: allRooms ? [] : selectedRooms,
        timezone,
        slot_duration_minutes: slotDuration,
        slot_interval_minutes: slotInterval,
        advance_booking_hours: advanceBookingHours,
        max_advance_days: maxAdvanceDays,
        primary_color: primaryColor,
        background_color: backgroundColor,
        border_radius: borderRadius,
        show_available_only: showAvailableOnly,
        read_only: readOnly,
        is_active: isActive,
        is_public: isPublic,
      };

      if (isNew) {
        const created = await integrationCalendars.create(data as any);
        toast.success("Calendario creado");
        router.push(`/settings/integrations/calendars/${created.id}`);
      } else {
        await integrationCalendars.update(id, data);
        toast.success("Cambios guardados");
        loadCalendar(id);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este calendario? Esta acción no se puede deshacer.")) return;
    try {
      await integrationCalendars.delete(id);
      toast.success("Calendario eliminado");
      router.push("/settings/integrations/calendars");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleAddField = async () => {
    if (!newField.field_key || !newField.field_label) {
      toast.error("Completa el key y la etiqueta del campo");
      return;
    }

    try {
      const created = await integrationCalendars.createField(id, newField);
      setCustomFields((prev) => [...prev, created]);
      setNewField({ field_key: "", field_label: "", field_type: "text", is_required: false });
      setShowNewField(false);
      toast.success("Campo añadido");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Error al crear campo");
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("¿Eliminar este campo?")) return;
    try {
      await integrationCalendars.deleteField(id, fieldId);
      setCustomFields((prev) => prev.filter((f) => f.id !== fieldId));
      toast.success("Campo eliminado");
    } catch {
      toast.error("Error al eliminar campo");
    }
  };

  const loadEmbedCode = async () => {
    try {
      const data = await integrationCalendars.getEmbedCode(id);
      setEmbedCode(data.iframe_code || "");
      setShowEmbed(true);
    } catch {
      toast.error("Error al obtener código embed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[var(--color-muted-foreground)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <div className="mb-8">
        <Link
          href="/settings/integrations/calendars"
          className="text-primary text-sm hover:underline mb-2 inline-block"
        >
          <ArrowLeft size={14} className="inline mr-1" />
          Volver a Calendarios
        </Link>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Calendar size={32} />
          {isNew ? "Nuevo Calendario" : `Editar: ${name}`}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  placeholder="Ej: Reserva Sala Escape Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  placeholder="ej: sala-premium"
                />
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  URL: {typeof window !== "undefined" ? window.location.origin : ""}/embed/calendar/{slug || "..."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Flow Type */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Tipo de Flujo</CardTitle>
            </CardHeader>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                    flowType === "room_first"
                      ? "border-primary bg-primary/5"
                      : "border-[var(--color-border)] hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="flowType"
                    value="room_first"
                    checked={flowType === "room_first"}
                    onChange={(e) => setFlowType(e.target.value as "room_first")}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium">Sala primero</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      El usuario selecciona primero la sala, luego la fecha y hora.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex p-4 border rounded-lg cursor-pointer transition-colors ${
                    flowType === "date_first"
                      ? "border-primary bg-primary/5"
                      : "border-[var(--color-border)] hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="flowType"
                    value="date_first"
                    checked={flowType === "date_first"}
                    onChange={(e) => setFlowType(e.target.value as "date_first")}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium">Fecha primero</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      El usuario selecciona primero la fecha, luego ve las salas disponibles.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Rooms */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Salas Incluidas</CardTitle>
            </CardHeader>
            <div className="p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={allRooms}
                  onChange={(e) => setAllRooms(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Todas las salas</span>
              </label>

              {!allRooms && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableRooms.map((room) => (
                    <label
                      key={room.id}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRooms.includes(room.id)
                          ? "border-primary bg-primary/5"
                          : "border-[var(--color-border)] hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRooms((prev) => [...prev, room.id]);
                          } else {
                            setSelectedRooms((prev) => prev.filter((r) => r !== room.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm truncate">{room.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Slot Configuration */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Configuración de Slots</CardTitle>
            </CardHeader>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duración slot (min)</label>
                  <input
                    type="number"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value) || 60)}
                    min={15}
                    max={240}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Intervalo (min)</label>
                  <input
                    type="number"
                    value={slotInterval}
                    onChange={(e) => setSlotInterval(parseInt(e.target.value) || 15)}
                    min={5}
                    max={60}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mín. horas antes</label>
                  <input
                    type="number"
                    value={advanceBookingHours}
                    onChange={(e) => setAdvanceBookingHours(parseInt(e.target.value) || 0)}
                    min={0}
                    max={168}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Máx. días antes</label>
                  <input
                    type="number"
                    value={maxAdvanceDays}
                    onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value) || 60)}
                    min={1}
                    max={365}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Custom Fields */}
          <Card className="border-beige">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Campos Personalizados</CardTitle>
                {isNew ? null : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowNewField(!showNewField)}
                  >
                    <Plus size={14} />
                    Añadir campo
                  </Button>
                )}
              </div>
            </CardHeader>
            <div className="p-6">
              {isNew && (
                <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                  Guarda el calendario primero para poder añadir campos personalizados.
                </p>
              )}

              {showNewField && !isNew && (
                <div className="mb-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-muted)]">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Key (ID)</label>
                      <input
                        type="text"
                        value={newField.field_key}
                        onChange={(e) =>
                          setNewField({ ...newField, field_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                        }
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background text-sm"
                        placeholder="ej: empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Etiqueta</label>
                      <input
                        type="text"
                        value={newField.field_label}
                        onChange={(e) => setNewField({ ...newField, field_label: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background text-sm"
                        placeholder="ej: Empresa"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Tipo</label>
                      <select
                        value={newField.field_type}
                        onChange={(e) => setNewField({ ...newField, field_type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background text-sm"
                      >
                        <option value="text">Texto</option>
                        <option value="textarea">Texto largo</option>
                        <option value="email">Email</option>
                        <option value="phone">Teléfono</option>
                        <option value="number">Número</option>
                        <option value="select">Selección</option>
                        <option value="checkbox">Casilla</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newField.is_required || false}
                          onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Requerido</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddField}>
                      Añadir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewField(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {customFields.length === 0 && !showNewField ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No hay campos personalizados. Añade campos para收集 información adicional en las reservas.
                </p>
              ) : (
                <div className="space-y-2">
                  {customFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical size={14} className="text-[var(--color-muted-foreground)]" />
                        <span className="font-medium">{field.field_label}</span>
                        <code className="text-xs bg-[var(--color-muted)] px-2 py-0.5 rounded">
                          {field.field_key}
                        </code>
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          {field.field_type}
                        </span>
                        {field.is_required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Requerido
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--color-muted-foreground)]">#{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-3">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save size={14} className="mr-2" />
                {saving ? "Guardando..." : isNew ? "Crear Calendario" : "Guardar Cambios"}
              </Button>

              {!isNew && (
                <>
                  <Button variant="secondary" onClick={loadEmbedCode} className="w-full">
                    <Code size={14} className="mr-2" />
                    Ver Código Embed
                  </Button>

                  <Button variant="danger" onClick={handleDelete} className="w-full">
                    <Trash2 size={14} className="mr-2" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Settings */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Activo</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Público</span>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Solo lectura</span>
                <input
                  type="checkbox"
                  checked={readOnly}
                  onChange={(e) => setReadOnly(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Solo mostrar disponibles</span>
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </Card>

          {/* Styles */}
          <Card className="border-beige">
            <CardHeader>
              <CardTitle>Estilos</CardTitle>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color primario</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color de fondo</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-background text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Border radius: {borderRadius}px</label>
                <input
                  type="range"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  min={0}
                  max={24}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Embed Preview */}
          {showEmbed && embedCode && (
            <Card className="border-beige">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code size={16} />
                  Código Embed
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <pre className="text-xs bg-[var(--color-muted)] p-3 rounded overflow-x-auto mb-3">
                  {embedCode}
                </pre>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => copyToClipboard(embedCode)}>
                    <Copy size={14} className="mr-1" />
                    Copiar
                  </Button>
                  <a
                    href={`/embed/calendar/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye size={14} className="mr-1" />
                      Vista previa
                      <ExternalLink size={12} className="ml-1" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
