"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Settings } from "lucide-react";
import Button from "@/components/Button";
import { WidgetConfig, WidgetConfigOptions } from "./types";
import { WIDGET_REGISTRY } from "./widget-registry";
import { cn } from "@/utils";

interface WidgetConfigModalProps {
  widget: WidgetConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgetId: string, config: WidgetConfigOptions) => void;
}

// Labels for config options
const CONFIG_LABELS: Record<keyof WidgetConfigOptions, string> = {
  showTrends: "Mostrar tendencias",
  columns: "Número de columnas",
  chartType: "Tipo de gráfico",
  showLegend: "Mostrar leyenda",
  dateRange: "Rango de fechas",
  defaultView: "Vista por defecto",
  showWeekends: "Mostrar fines de semana",
  maxNotes: "Máximo de notas",
  limit: "Límite de elementos",
  showPastSessions: "Mostrar sesiones pasadas",
  pageSize: "Elementos por página",
  sortBy: "Ordenar por",
  title: "Título personalizado",
  refreshInterval: "Intervalo de actualización (seg)",
  visibleStats: "Estadísticas visibles",
  defaultPeriod: "Período por defecto",
  targetMonthly: "Meta mensual (€)",
};

// Options for select fields
const SELECT_OPTIONS: Partial<
  Record<keyof WidgetConfigOptions, { value: string; label: string }[]>
> = {
  chartType: [
    { value: "bar", label: "Barras" },
    { value: "line", label: "Líneas" },
    { value: "area", label: "Área" },
  ],
  dateRange: [
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
    { value: "quarter", label: "Trimestre" },
    { value: "year", label: "Año" },
  ],
  defaultView: [
    { value: "month", label: "Mes" },
    { value: "week", label: "Semana" },
    { value: "day", label: "Día" },
  ],
  sortBy: [
    { value: "date", label: "Fecha" },
    { value: "amount", label: "Monto" },
    { value: "name", label: "Nombre" },
  ],
};

export function WidgetConfigModal({
  widget,
  isOpen,
  onClose,
  onSave,
}: WidgetConfigModalProps) {
  const def = WIDGET_REGISTRY[widget.type];
  const [config, setConfig] = useState<WidgetConfigOptions>({});
  const prevOpenRef = useRef(false);

  useEffect(() => {
    // Solo inicializar config cuando el modal se abre (no cuando ya está abierto)
    if (isOpen && !prevOpenRef.current && def) {
      setConfig({
        ...def.defaultConfig,
        ...widget.config,
      });
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, widget, def]);

  if (!isOpen || !def) return null;

  const configurableOptions = def.configurableOptions || [];

  const handleChange = (key: keyof WidgetConfigOptions, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(widget.id, config);
    onClose();
  };

  const renderField = (optionKey: keyof WidgetConfigOptions) => {
    const value = config[optionKey];
    const label = CONFIG_LABELS[optionKey] || optionKey;

    // Array fields (multi-select/checkboxes)
    if (optionKey === "visibleStats") {
      const statsOptions = [
        { id: "revenue", label: "Ingresos" },
        { id: "bookings", label: "Reservas" },
        { id: "customers", label: "Clientes" },
        { id: "rooms", label: "Salas" },
      ];
      const currentStats = (value as string[]) || [];

      return (
        <div key={optionKey} className="py-2">
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
            {label}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statsOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currentStats.includes(opt.id)}
                  onChange={(e) => {
                    const newStats = e.target.checked
                      ? [...currentStats, opt.id]
                      : currentStats.filter((id) => id !== opt.id);
                    handleChange(optionKey, newStats);
                  }}
                  className="rounded border-[var(--color-beige)] text-primary focus:ring-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Boolean fields (checkbox)
    if (typeof value === "boolean" || optionKey.startsWith("show")) {
      return (
        <div key={optionKey} className="flex items-center justify-between py-2">
          <label className="text-sm font-medium text-[var(--color-foreground)]">{label}</label>
          <button
            type="button"
            onClick={() => handleChange(optionKey, !value)}
            aria-label={label}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors",
              value ? "bg-primary" : "bg-[var(--color-muted)]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-[var(--color-background)] rounded-full transition-transform",
                value && "translate-x-5"
              )}
            />
          </button>
        </div>
      );
    }

    // Select fields
    if (SELECT_OPTIONS[optionKey]) {
      return (
        <div key={optionKey} className="py-2">
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
            {label}
          </label>
          <select
            value={value as string}
            onChange={(e) => handleChange(optionKey, e.target.value)}
            aria-label={label}
            className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg text-sm focus:border-primary focus:outline-none"
          >
            {SELECT_OPTIONS[optionKey]!.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Number fields
    if (typeof value === "number") {
      return (
        <div key={optionKey} className="py-2">
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
            {label}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              handleChange(optionKey, parseInt(e.target.value) || 0)
            }
            min={1}
            aria-label={label}
            className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg text-sm focus:border-primary focus:outline-none"
          />
        </div>
      );
    }

    // String fields
    if (typeof value === "string") {
      return (
        <div key={optionKey} className="py-2">
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
            {label}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(optionKey, e.target.value)}
            aria-label={label}
            className="w-full px-3 py-2 border-2 border-[var(--color-beige)] rounded-lg text-sm focus:border-primary focus:outline-none"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-background)] rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">Configurar Widget</h3>
              <p className="text-sm text-secondary">{def.title}</p>
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

        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {configurableOptions.length > 0 ? (
            configurableOptions.map((optionKey) => renderField(optionKey))
          ) : (
            <p className="text-center text-secondary py-8">
              Este widget no tiene opciones configurables.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--color-beige)]">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
    </div>
  );
}
