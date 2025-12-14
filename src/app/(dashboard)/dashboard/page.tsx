"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  Plus,
  X,
  Trash2,
  GripVertical,
  LayoutTemplate,
  Check,
  ChevronDown,
  Cog,
  FolderOpen,
} from "lucide-react";
import Button from "@/components/Button";
import { WIDGET_REGISTRY } from "@/components/domain/dashboard/widget-registry";
import {
  WidgetConfig,
  WidgetType,
  WidgetConfigOptions,
} from "@/components/domain/dashboard/types";
import { WidgetConfigModal } from "@/components/domain/dashboard/WidgetConfigModal";
import { SaveCollectionModal } from "@/components/domain/dashboard/SaveCollectionModal";
import { TemplatePreviewCompact } from "@/components/domain/dashboard/TemplatePreview";
import { cn } from "@/utils";
import dashboardService, { DashboardTemplate } from "@/services/dashboard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

// Updated default layout with higher resolution values (12 columns, 10px rows)
const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "stats-1", type: "stats", colSpan: 48, rowSpan: 6 },
  { id: "quarterly-1", type: "quarterly-stats", colSpan: 24, rowSpan: 12 },
  { id: "revenue-chart-1", type: "revenue-chart", colSpan: 24, rowSpan: 16 },
  { id: "upcoming-1", type: "upcoming", colSpan: 24, rowSpan: 20 },
  { id: "occupancy-1", type: "occupancy-chart", colSpan: 12, rowSpan: 14 },
  { id: "calendar-1", type: "calendar", colSpan: 12, rowSpan: 16 },
];

function WidgetItem({
  widget,
  isEditMode,
  onRemove,
  onResize,
  onConfigure,
  dragHandleProps,
  style,
  isDragging,
}: {
  widget: WidgetConfig;
  isEditMode: boolean;
  onRemove?: (id: string) => void;
  onResize?: (
    id: string,
    newSpan: number,
    dimension: "width" | "height"
  ) => void;
  onConfigure?: (widget: WidgetConfig) => void;
  dragHandleProps?: any;
  style?: React.CSSProperties;
  isDragging?: boolean;
}) {
  const def = WIDGET_REGISTRY[widget.type];
  const [isBlinking, setIsBlinking] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  if (!def) return null;
  const Component = def.component;

  // Merge default config with widget-specific config
  const widgetConfig = { ...def.defaultConfig, ...widget.config };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    dimension: "width" | "height"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startColSpan = widget.colSpan || 48;
    const startRowSpan = widget.rowSpan || 8;

    // Calculate column width based on current element width and span
    const element = elementRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    // Calculate the width of a single column unit (1/12 of total width roughly)
    const colWidth = rect.width / startColSpan;
    const rowHeight = 10; // Matches auto-rows-[10px]

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const currentY = moveEvent.clientY;

      let delta = 0;
      let newSpan = 0;
      let isLimitReached = false;

      if (dimension === "width") {
        const diff = currentX - startX;
        delta = Math.round(diff / colWidth);
        newSpan = startColSpan + delta;

        // Limits for width (1 to 48)
        if (newSpan < 1 || newSpan > 48) {
          isLimitReached = true;
        }
      } else {
        const diff = currentY - startY;
        delta = Math.round(diff / rowHeight);
        newSpan = startRowSpan + delta;

        // Limits for height (min 5 rows ~ 50px)
        if (newSpan < 5) {
          isLimitReached = true;
        }
      }

      if (isLimitReached) {
        if (!isBlinking) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 300);
        }
      } else {
        // Only trigger update if span actually changed
        if (
          (dimension === "width" && newSpan !== widget.colSpan) ||
          (dimension === "height" && newSpan !== widget.rowSpan)
        ) {
          onResize?.(widget.id, newSpan, dimension);
        }
      }
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    document.body.style.cursor =
      dimension === "width" ? "col-resize" : "row-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    // eslint-disable-next-line react-dom/no-unsafe-inline-style
    <div
      ref={elementRef}
      style={style}
      className={cn(
        "relative group h-full w-full transition-all duration-200 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        isEditMode && "ring-2 ring-dashed ring-primary/30 cursor-default",
        isDragging && "opacity-30",
        isBlinking && "ring-4 ring-red-500 ring-opacity-100"
      )}
    >
      {isEditMode && (
        <>
          {/* Resize Handle - Right Edge (Width) */}
          {onResize && (
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "width")}
              className="absolute top-0 bottom-0 -right-1 w-4 z-30 cursor-col-resize flex items-center justify-center group/handle hover:bg-primary/10 rounded-r-md transition-colors"
              title="Arrastrar para cambiar ancho"
            >
              <div className="w-1 h-8 bg-gray-300 rounded-full group-hover/handle:bg-primary transition-colors" />
            </div>
          )}

          {/* Resize Handle - Bottom Edge (Height) */}
          {onResize && (
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "height")}
              className="absolute bottom-0 left-0 right-0 h-4 z-30 cursor-row-resize flex items-center justify-center group/handle hover:bg-primary/10 rounded-b-md transition-colors"
              title="Arrastrar para cambiar alto"
            >
              <div className="h-1 w-8 bg-gray-300 rounded-full group-hover/handle:bg-primary transition-colors" />
            </div>
          )}

          <div className="absolute top-2 right-2 z-20 flex gap-1 bg-white shadow-md rounded-full p-1 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              {...dragHandleProps}
              className="p-1 hover:bg-beige rounded-full cursor-grab active:cursor-grabbing group"
              title="Arrastrar"
            >
              <GripVertical className="h-4 w-4 text-secondary group-hover:text-dark" />
            </button>
            {onConfigure &&
              def.configurableOptions &&
              def.configurableOptions.length > 0 && (
                <>
                  <div className="w-px bg-gray-200 mx-1" />
                  <button
                    onClick={() => onConfigure(widget)}
                    className="p-1 hover:bg-blue-50 text-blue-500 rounded-full"
                    title="Configurar widget"
                  >
                    <Cog className="h-4 w-4" />
                  </button>
                </>
              )}
            <div className="w-px bg-gray-200 mx-1" />
            {onRemove && (
              <button
                onClick={() => onRemove(widget.id)}
                className="p-1 hover:bg-red-50 text-red-500 rounded-full"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </>
      )}
      <div className="h-full w-full overflow-auto">
        <Component {...widgetConfig} />
      </div>
    </div>
  );
}

function SortableWidget({
  widget,
  isEditMode,
  onRemove,
  onResize,
  onConfigure,
}: {
  widget: WidgetConfig;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onResize: (
    id: string,
    newSpan: number,
    dimension: "width" | "height"
  ) => void;
  onConfigure: (widget: WidgetConfig) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.colSpan || 48} / span ${widget.colSpan || 48}`,
    gridRow: `span ${widget.rowSpan || 8} / span ${widget.rowSpan || 8}`,
  };

  return (
    // eslint-disable-next-line react-dom/no-unsafe-inline-style
    <div ref={setNodeRef} style={style} className="relative">
      <WidgetItem
        widget={widget}
        isEditMode={isEditMode}
        onRemove={onRemove}
        onResize={onResize}
        onConfigure={onConfigure}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_LAYOUT);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Template state
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Widget config modal state
  const [configModalWidget, setConfigModalWidget] =
    useState<WidgetConfig | null>(null);

  // Collections modal state
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  // Handler to open config modal
  const handleConfigureWidget = (widget: WidgetConfig) => {
    setConfigModalWidget(widget);
  };

  // Handler to save widget config
  const handleSaveWidgetConfig = (
    widgetId: string,
    config: WidgetConfigOptions
  ) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
      )
    );
  };

  // Handler to load collection
  const handleLoadCollection = (layout: WidgetConfig[]) => {
    setWidgets(layout);
    localStorage.setItem("dashboard-layout", JSON.stringify(layout));
  };

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await dashboardService.getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Apply a template layout
  const applyTemplate = (template: DashboardTemplate) => {
    const newLayout: WidgetConfig[] = template.layout.map((item) => ({
      id: item.id,
      type: item.type as WidgetType,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
      config: item.config,
    }));
    setWidgets(newLayout);
    localStorage.setItem("dashboard-layout", JSON.stringify(newLayout));
    setShowTemplateSelector(false);
  };

  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboard-layout");
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        // Migration check: if we detect the old 12-column grid values
        // The 'stats' widget is a good indicator, it should be full width (48)
        // If it's 12 or less, we're likely on the old scale
        const isOldScale = parsedLayout.some(
          (w: WidgetConfig) => w.type === "stats" && (w.colSpan || 12) <= 12
        );

        if (isOldScale) {
          console.log(
            "Migrating dashboard layout from 12-col to 48-col system"
          );
          const migratedLayout = parsedLayout.map((w: WidgetConfig) => ({
            ...w,
            colSpan: (w.colSpan || 12) * 4,
          }));
          setWidgets(migratedLayout);
        } else {
          setWidgets(parsedLayout);
        }
      } catch (e) {
        console.error("Failed to parse dashboard layout", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("dashboard-layout", JSON.stringify(widgets));
    }
  }, [widgets, isLoaded]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setShowAddWidget(false);
  };

  const addWidget = (type: WidgetType) => {
    const def = WIDGET_REGISTRY[type];
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type,
      colSpan: def.defaultColSpan,
      rowSpan: def.defaultRowSpan || 8,
    };
    setWidgets([...widgets, newWidget]);
    setShowAddWidget(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleResize = (
    id: string,
    newSpan: number,
    dimension: "width" | "height"
  ) => {
    setWidgets(
      widgets.map((w) => {
        if (w.id === id) {
          if (dimension === "width") {
            return { ...w, colSpan: Math.max(1, Math.min(48, newSpan)) };
          } else {
            return { ...w, rowSpan: Math.max(5, newSpan) };
          }
        }
        return w;
      })
    );
  };

  const resetLayout = () => {
    setWidgets(
      widgets.map((w) => {
        const def = WIDGET_REGISTRY[w.type];
        return {
          ...w,
          colSpan: def.defaultColSpan,
          rowSpan: def.defaultRowSpan || 8,
        };
      })
    );
  };

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="flex items-center justify-between">
        <nav className="flex items-center text-sm text-secondary">
          <span className="hover:text-dark cursor-pointer">Inicio</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-dark font-medium">Dashboard</span>
        </nav>
        <div className="flex gap-2 flex-wrap">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      "¿Estás seguro de que quieres restablecer el diseño original?"
                    )
                  ) {
                    setWidgets(DEFAULT_LAYOUT);
                    localStorage.removeItem("dashboard-layout");
                    setIsEditMode(false);
                  }
                }}
                className="bg-white text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Restablecer
              </Button>
              {/* Template Selector Button */}
              <div className="relative">
                <Button
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  variant="outline"
                  size="sm"
                  className="text-dark border-gray-300 bg-white hover:bg-beige hover:text-dark"
                  disabled={isLoadingTemplates}
                >
                  <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
                  Plantillas
                  <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
                {showTemplateSelector && templates.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="font-semibold text-dark text-sm">
                        Seleccionar Plantilla
                      </h4>
                      <p className="text-xs text-secondary mt-1">
                        Elige una plantilla predefinida
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="w-full text-left px-4 py-3 hover:bg-beige transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex gap-3">
                            {/* Template Preview */}
                            <TemplatePreviewCompact
                              layout={template.layout}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-dark truncate">
                                  {template.name}
                                </span>
                                {template.is_default && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                                    Default
                                  </span>
                                )}
                              </div>
                              {template.description && (
                                <p className="text-xs text-secondary mt-1 line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {template.layout.length} widgets
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={resetLayout}
                variant="outline"
                size="sm"
                className="text-dark border-gray-300 bg-white hover:bg-beige hover:text-dark"
              >
                <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
                Ordenar
              </Button>
              <Button
                onClick={() => setShowCollectionsModal(true)}
                variant="outline"
                size="sm"
                className="text-dark border-gray-300 bg-white hover:bg-beige hover:text-dark"
              >
                <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                Colecciones
              </Button>
              <Button
                onClick={() => setShowAddWidget(true)}
                size="sm"
                className="bg-primary text-white"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Añadir Widget
              </Button>
            </>
          )}
          <Button
            variant={isEditMode ? "primary" : "outline"}
            size="sm"
            onClick={toggleEditMode}
            className={isEditMode ? "bg-accent text-dark border-accent hover:bg-accent/80" : "hover:bg-beige hover:text-dark"}
          >
            {isEditMode ? (
              <X className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Settings className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isEditMode ? "Finalizar" : "Editar"}
          </Button>
        </div>
      </div>

      {/* Add Widget Modal/Panel */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-dark">Añadir Widget</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="text-gray-500 hover:text-dark"
                aria-label="Cerrar modal"
                title="Cerrar modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(WIDGET_REGISTRY).map((def) => {
                const isAdded = widgets.some((w) => w.type === def.type);
                return (
                  <button
                    key={def.type}
                    onClick={() => addWidget(def.type as WidgetType)}
                    className={cn(
                      "flex flex-col items-start p-4 border-2 rounded-lg transition-all text-left relative overflow-hidden",
                      isAdded
                        ? "border-primary/30 bg-primary/5"
                        : "border-beige hover:border-primary hover:bg-light"
                    )}
                  >
                    <div className="flex justify-between items-start w-full mb-1">
                      <span
                        className={cn(
                          "font-bold",
                          isAdded ? "text-primary" : "text-dark"
                        )}
                      >
                        {def.title}
                      </span>
                      {isAdded && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-primary text-white px-2 py-0.5 rounded-full">
                          <Check size={10} />
                          Añadido
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-secondary">
                      {def.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          {/* eslint-disable-next-line react-dom/no-unsafe-inline-style */}
          <div
            className="grid gap-4 auto-rows-[10px]"
            style={{ gridTemplateColumns: "repeat(48, minmax(0, 1fr))" }}
          >
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onRemove={removeWidget}
                onResize={handleResize}
                onConfigure={handleConfigureWidget}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeWidget ? (
            // eslint-disable-next-line react-dom/no-unsafe-inline-style
            <div
              style={{
                width: `calc(${((activeWidget.colSpan || 48) / 48) * 100}% - ${
                  (48 - (activeWidget.colSpan || 48)) / 48
                } * 1rem)`,
                height: `calc(${(activeWidget.rowSpan || 8) * 10}px + ${
                  (activeWidget.rowSpan || 8) - 1
                } * 1rem)`,
              }}
              className="opacity-90"
            >
              <WidgetItem
                widget={activeWidget}
                isEditMode={true}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Widget Configuration Modal */}
      {configModalWidget && (
        <WidgetConfigModal
          widget={configModalWidget}
          isOpen={!!configModalWidget}
          onClose={() => setConfigModalWidget(null)}
          onSave={handleSaveWidgetConfig}
        />
      )}

      {/* User Collections Modal */}
      <SaveCollectionModal
        isOpen={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        currentLayout={widgets}
        onLoadCollection={handleLoadCollection}
      />
    </div>
  );
}
