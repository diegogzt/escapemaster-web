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
  Save,
} from "lucide-react";
import Button from "@/components/Button";
import { useWidgetRegistry } from "@/components/domain/dashboard/useWidgetRegistry";
import {
  WidgetConfig,
  WidgetType,
  WidgetConfigOptions,
  WidgetDefinition
} from "@/components/domain/dashboard/types";
import { WidgetConfigModal } from "@/components/domain/dashboard/WidgetConfigModal";
import { SaveCollectionModal } from "@/components/domain/dashboard/SaveCollectionModal";
import { TemplatePreviewCompact } from "@/components/domain/dashboard/TemplatePreview";
import { cn } from "@/utils";
import { widgets as dashboardService, type DashboardTemplate } from "@/services/api";
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

import {
  useDashboardLayoutStore,
  useDashboardLayoutActions,
  DEFAULT_LAYOUT,
} from "@/stores/dashboard-layout-store";

function WidgetItem({
  widget,
  registry,
  isEditMode,
  onRemove,
  onResize,
  onConfigure,
  dragHandleProps,
  style,
  isDragging,
  isBlinking: externalIsBlinking,
}: {
  widget: WidgetConfig;
  registry: Record<string, WidgetDefinition>;
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
  isBlinking?: boolean;
}) {
  const def = registry[widget.type];
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

    const element = elementRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const colWidth = rect.width / startColSpan;
    const rowHeight = 10;

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

        if (newSpan < (def.minColSpan || 1) || newSpan > 48) {
           newSpan = Math.max((def.minColSpan || 1), Math.min(48, newSpan));
           isLimitReached = true;
        }
      } else {
        const diff = currentY - startY;
        delta = Math.round(diff / rowHeight);
        newSpan = startRowSpan + delta;

        if (newSpan < (def.minRowSpan || 1)) {
           newSpan = Math.max((def.minRowSpan || 1), newSpan);
           isLimitReached = true;
        }
      }

      if (isLimitReached) {
        if (!isBlinking) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 300);
        }
      } 
      
      if (
          (dimension === "width" && newSpan !== widget.colSpan) ||
          (dimension === "height" && newSpan !== widget.rowSpan)
        ) {
          onResize?.(widget.id, newSpan, dimension);
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
    <div
      ref={elementRef}
      style={style}
      className={cn(
        "relative group h-full w-full transition-all duration-200 bg-[var(--color-background)] rounded-xl shadow-sm border border-[var(--color-beige)] overflow-hidden",
        isEditMode && "ring-2 ring-dashed ring-primary/30 cursor-default",
        isDragging && "opacity-30",
        (isBlinking || externalIsBlinking) && "ring-4 ring-red-500 ring-opacity-100"
      )}
    >
      {isEditMode && (
        <>
          {onResize && (
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "width")}
              className="absolute top-0 bottom-0 -right-1 w-4 z-30 cursor-col-resize flex items-center justify-center group/handle hover:bg-primary/10 rounded-r-md transition-colors"
              title="Arrastrar para cambiar ancho"
            >
              <div className="w-1 h-8 bg-gray-300 rounded-full group-hover/handle:bg-primary transition-colors" />
            </div>
          )}

          {onResize && (
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "height")}
              className="absolute bottom-0 left-0 right-0 h-4 z-30 cursor-row-resize flex items-center justify-center group/handle hover:bg-primary/10 rounded-b-md transition-colors"
              title="Arrastrar para cambiar alto"
            >
              <div className="h-1 w-8 bg-gray-300 rounded-full group-hover/handle:bg-primary transition-colors" />
            </div>
          )}

          <div className="absolute top-2 right-2 z-20 flex gap-1 bg-[var(--color-background)] shadow-md rounded-full p-1 border border-[var(--color-beige)] opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              {...dragHandleProps}
              className="p-1 hover:bg-beige rounded-full cursor-grab active:cursor-grabbing group"
              title="Arrastrar"
            >
              <GripVertical className="h-4 w-4 text-secondary group-hover:text-[var(--color-foreground)]" />
            </button>
            {onConfigure &&
              def.configurableOptions &&
              def.configurableOptions.length > 0 && (
                <>
                  <div className="w-px bg-[var(--color-background-soft)] mx-1" />
                  <button
                    onClick={() => onConfigure(widget)}
                    className="p-1 hover:bg-blue-50 text-blue-500 rounded-full"
                    title="Configurar widget"
                  >
                    <Cog className="h-4 w-4" />
                  </button>
                </>
              )}
            <div className="w-px bg-[var(--color-background-soft)] mx-1" />
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
  registry,
  isEditMode,
  onRemove,
  onResize,
  onConfigure,
  isMobile,
}: {
  widget: WidgetConfig;
  registry: Record<string, any>;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onResize: (
    id: string,
    newSpan: number,
    dimension: "width" | "height"
  ) => void;
  onConfigure: (widget: WidgetConfig) => void;
  isMobile: boolean;
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
    gridColumn: isMobile
      ? "span 1"
      : `span ${widget.colSpan || 48} / span ${widget.colSpan || 48}`,
    gridRow: isMobile
      ? "auto"
      : `span ${widget.rowSpan || 8} / span ${widget.rowSpan || 8}`,
    height: isMobile ? "auto" : "100%",
    marginBottom: isMobile ? "1rem" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative h-full">
      <WidgetItem
        widget={widget}
        registry={registry}
        isEditMode={isEditMode}
        onRemove={onRemove}
        onResize={onResize}
        onConfigure={onConfigure}
        dragHandleProps={{ ...attributes, ...listeners }}
        style={style}
        isDragging={isDragging}
      />
    </div>
  );
}

export function DashboardView() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use dynamic registry
  const { registry } = useWidgetRegistry();
  
  // Use persistent store with safety check
  const { widgets: rawWidgets, activeCollectionId } = useDashboardLayoutStore();
  console.log("DEBUG: DashboardView widgets from store:", rawWidgets);
  const widgets = Array.isArray(rawWidgets) ? rawWidgets : [];
  const { setWidgets, updateWidgetConfig, setActiveCollectionId, resetLayout: resetStoreLayout } = useDashboardLayoutActions();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMounted]);

  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [configModalWidget, setConfigModalWidget] = useState<WidgetConfig | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  
  // Track if we have synced with server to enable auto-save
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfigureWidget = (widget: WidgetConfig) => setConfigModalWidget(widget);
  
  const handleSaveWidgetConfig = (widgetId: string, config: WidgetConfigOptions) => {
    updateWidgetConfig(widgetId, config);
  };

  const applyTemplate = (template: DashboardTemplate) => {
    console.log("DEBUG: Applying template:", template);
    if (!template || !Array.isArray(template.layout)) {
      console.error("DEBUG: Invalid template layout:", template);
      return;
    }
    const newLayout: WidgetConfig[] = template.layout.map((item: any) => ({
      id: item.id || `tpl-${Date.now()}-${Math.random()}`,
      type: item.type as WidgetType,
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
      config: item.config,
    }));
    setWidgets(newLayout);
    setShowTemplateSelector(false);
  };

  useEffect(() => {
    if (!isMounted) return;

    // Load from server in background to sync, but don't block UI
    const syncLayout = async () => {
      try {
        const collections = await dashboardService.getCollections();
        console.log("DEBUG: Dashboard collections received:", collections);
        
        if (Array.isArray(collections)) {
          const activeCollection = collections.find((c: any) => c.is_active);

          if (activeCollection) {
            console.log("DEBUG: Setting widgets from active collection:", activeCollection);
            setWidgets(activeCollection.layout as WidgetConfig[]);
            setActiveCollectionId(activeCollection.id);
          }
        } else {
           console.warn("DEBUG: collections is not an array:", collections);
        }
      } catch (e) {
        console.error("Failed to sync dashboard layout", e);
      } finally {
        setIsServerSynced(true);
      }
    };
    syncLayout();

    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await dashboardService.getTemplates();
        console.log("DEBUG: Dashboard templates received:", data);
        if (Array.isArray(data)) {
          setTemplates(data);
        } else {
          console.warn("DEBUG: templates data is not an array:", data);
          setTemplates([]);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [isMounted, setWidgets, setActiveCollectionId]);

  useEffect(() => {
    if (!isMounted) return;
    
    const autoSave = async () => {
      if (isServerSynced && activeCollectionId && !isSaving) {
        try {
          await dashboardService.updateCollection(activeCollectionId, {
            layout: widgets as any,
          });
        } catch (e) {
          console.error("Failed to auto-save dashboard layout", e);
        }
      }
    };

    const timer = setTimeout(() => { autoSave(); }, 2000);
    return () => clearTimeout(timer);
  }, [widgets, isServerSynced, activeCollectionId, isSaving, isMounted]);

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      if (activeCollectionId) {
        await dashboardService.updateCollection(activeCollectionId, {
          layout: widgets as any,
        });
      } else {
        const name = prompt("Nombre para esta colección de widgets:", "Mi Dashboard");
        if (name) {
          const newCollection = await dashboardService.createCollection({
            name,
            layout: widgets as any,
          });
          await dashboardService.activateCollection(newCollection.id);
          setActiveCollectionId(newCollection.id);
        }
      }
    } catch (e) {
      console.error("Failed to save dashboard layout", e);
    } finally {
      setIsSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = widgets.findIndex((item) => item.id === active.id);
        const newIndex = widgets.findIndex((item) => item.id === over.id);
        setWidgets(arrayMove(widgets, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setShowAddWidget(false);
  };

  const addWidget = (type: WidgetType) => {
    const def = registry[type]; // Use dynamic registry
    if (!def) {
      console.warn(`DEBUG: Widget definition not found for type: ${type}`);
      return;
    }
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type,
      colSpan: def.defaultColSpan || 48,
      rowSpan: def.defaultRowSpan || 8,
    };
    setWidgets([...widgets, newWidget]);
    setShowAddWidget(false);
  };

  const removeWidget = (id: string) => setWidgets(widgets.filter((w) => w.id !== id));

  const handleResize = (id: string, newSpan: number, dimension: "width" | "height") => {
    setWidgets(widgets.map((w) => {
      if (w.id === id) {
        const def = registry[w.type]; // Use dynamic registry
        if (!def) return w;
        
        if (dimension === "width") {
            const minW = def.minColSpan || 1;
            return { ...w, colSpan: Math.max(minW, Math.min(48, newSpan)) };
        }
        const minH = def.minRowSpan || 1;
        return { ...w, rowSpan: Math.max(minH, newSpan) };
      }
      return w;
    }));
  };

  const resetLayout = () => {
      resetStoreLayout(DEFAULT_LAYOUT);
  };

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  if (!isMounted) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-screen pb-20">

      <div className="flex items-center justify-between">
        <nav className="flex items-center text-sm text-secondary">
          <span className="hover:text-[var(--color-foreground)] cursor-pointer">Inicio</span>
          <span className="mx-2 text-[var(--color-muted-foreground)]">/</span>
          <span className="text-[var(--color-foreground)] font-medium">Dashboard</span>
        </nav>
        <div className="flex gap-2 flex-wrap">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("¿Estás seguro de que quieres restablecer el diseño original?")) {
                    setWidgets(DEFAULT_LAYOUT);
                    setIsEditMode(false);
                  }
                }}
                className="bg-[var(--color-background)] text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Restablecer
              </Button>
              <div className="relative">
                <Button
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  variant="outline"
                  size="sm"
                  className="text-[var(--color-foreground)] border-[var(--color-beige)] bg-[var(--color-background)] hover:bg-beige hover:text-[var(--color-foreground)]"
                  disabled={isLoadingTemplates}
                >
                  <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
                  Plantillas
                  <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
                {showTemplateSelector && templates.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--color-background)] rounded-xl shadow-lg border border-[var(--color-beige)] z-50 overflow-hidden">
                    <div className="p-3 border-b border-[var(--color-beige)]">
                      <h4 className="font-semibold text-[var(--color-foreground)] text-sm">Seleccionar Plantilla</h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {templates.map((template) => (
                        <button key={template.id} onClick={() => applyTemplate(template)} className="w-full text-left px-4 py-3 hover:bg-beige transition-colors border-b border-gray-50 last:border-0">
                          <div className="flex gap-3">
                            <TemplatePreviewCompact layout={template.layout} className="flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-[var(--color-foreground)] truncate">{template.name}</span>
                              <p className="text-xs text-secondary mt-1">{template.layout.length} widgets</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={resetLayout} variant="outline" size="sm" className="text-[var(--color-foreground)] border-[var(--color-beige)] bg-[var(--color-background)] hover:bg-beige hover:text-[var(--color-foreground)]">
                <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
                Ordenar
              </Button>
              <Button onClick={() => setShowAddWidget(true)} size="sm" className="bg-primary text-white">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Añadir Widget
              </Button>
            </>
          )}
          <Button onClick={handleSaveLayout} variant="outline" size="sm" className={cn("text-[var(--color-foreground)] border-[var(--color-beige)] bg-[var(--color-background)] hover:bg-beige hover:text-[var(--color-foreground)]", activeCollectionId && "border-primary/30 text-primary")} disabled={isSaving}>
            <Save className={cn("mr-1.5 h-3.5 w-3.5", isSaving && "animate-spin")} />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant={isEditMode ? "primary" : "outline"} size="sm" onClick={toggleEditMode} className={isEditMode ? "bg-accent text-[var(--color-foreground)] border-accent hover:bg-accent/80" : "hover:bg-beige hover:text-[var(--color-foreground)]"}>
            {isEditMode ? <X className="mr-1.5 h-3.5 w-3.5" /> : <Settings className="mr-1.5 h-3.5 w-3.5" />}
            {isEditMode ? "Finalizar" : "Editar"}
          </Button>
        </div>
      </div>

      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-background)] rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">Añadir Widget</h3>
              <button onClick={() => setShowAddWidget(false)} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]" aria-label="Cerrar modal" title="Cerrar modal">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(registry || {}).map((def) => {
                if (!def) return null;
                const isAdded = widgets.some((w) => w.type === def.type);
                return (
                  <button key={def.type} onClick={() => addWidget(def.type as WidgetType)} className={cn("flex flex-col items-start p-4 border-2 rounded-lg transition-all text-left relative overflow-hidden", isAdded ? "border-primary/30 bg-primary/5" : "border-beige hover:border-primary hover:bg-[var(--color-light)]")}>
                    <span className={cn("font-bold", isAdded ? "text-primary" : "text-[var(--color-foreground)]")}>{def.title}</span>
                    <span className="text-sm text-secondary">{def.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1 auto-rows-auto" : "auto-rows-[10px]")} style={isMobile ? {} : { gridTemplateColumns: "repeat(48, minmax(0, 1fr))" }}>
            {widgets.map((widget) => (
              <SortableWidget 
                key={widget.id} 
                widget={widget} 
                registry={registry} // Pass registry
                isEditMode={isEditMode} 
                onRemove={removeWidget} 
                onResize={handleResize} 
                onConfigure={handleConfigureWidget} 
                isMobile={isMobile} 
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeWidget ? (
            <div style={{ width: "100%", height: "100%", cursor: "grabbing" }}>
               <WidgetItem 
                  widget={activeWidget} 
                  registry={registry} // Pass registry
                  isEditMode={isEditMode} 
                  isDragging 
               />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {configModalWidget && (
        <WidgetConfigModal
          isOpen={!!configModalWidget}
          onClose={() => setConfigModalWidget(null)}
          widget={configModalWidget}
          onSave={handleSaveWidgetConfig}
        />
      )}
    </div>
  );
}
