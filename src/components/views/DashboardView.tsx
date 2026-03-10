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
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


// Local DEFAULT_LAYOUT removed in favor of store import

function WidgetItem({
  widget,
  isEditMode,
  onRemove,
  onResizeCommit,
  onConfigure,
  dragHandleProps,
  isDragging,
  wrapperRef,
  colWidth,
}: {
  widget: WidgetConfig;
  isEditMode: boolean;
  onRemove?: (id: string) => void;
  /** Called ONLY on mouse-up with the final span value */
  onResizeCommit?: (id: string, newSpan: number, dimension: "width" | "height") => void;
  onConfigure?: (widget: WidgetConfig) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
  /** The outer SortableWidget div—used to update gridColumn/gridRow directly during drag */
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
  /** Width of one grid column in px */
  colWidth: number;
}) {
  const def = WIDGET_REGISTRY[widget.type];
  const [isBlinking, setIsBlinking] = useState(false);

  if (!def) return null;
  const Component = def.component;
  const widgetConfig = { ...def.defaultConfig, ...widget.config };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    dimension: "width" | "height"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startColSpan = widget.colSpan || def.defaultColSpan || 6;
    const startRowSpan = widget.rowSpan || def.defaultRowSpan || 4;
    const rowHeight = 50;
    const minW = def.minColSpan || 1;
    const maxW = 6;
    const minH = def.minRowSpan || 2;
    const maxH = 80;

    let lastSpan = dimension === "width" ? startColSpan : startRowSpan;
    let rafId: number | null = null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        let newSpan: number;

        if (dimension === "width") {
          const delta = Math.round((moveEvent.clientX - startX) / colWidth);
          newSpan = Math.max(minW, Math.min(maxW, startColSpan + delta));
        } else {
          const delta = Math.round((moveEvent.clientY - startY) / rowHeight);
          newSpan = Math.max(minH, Math.min(maxH, startRowSpan + delta));
        }

        if (newSpan !== lastSpan) {
          lastSpan = newSpan;
          // Update the WRAPPER div directly — zero React re-renders during drag
          if (wrapperRef?.current) {
            if (dimension === "width") {
              wrapperRef.current.style.gridColumn = `span ${newSpan} / span ${newSpan}`;
            } else {
              wrapperRef.current.style.gridRow = `span ${newSpan} / span ${newSpan}`;
            }
          }
        }

        const atLimit = (dimension === "width" && (newSpan === minW || newSpan === maxW)) ||
                        (dimension === "height" && (newSpan === minH || newSpan === maxH));
        if (atLimit && !isBlinking) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 300);
        }
      });
    };

    const handleMouseUp = () => {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      // Commit final span to state only once
      onResizeCommit?.(widget.id, lastSpan, dimension);
    };

    document.body.style.cursor = dimension === "width" ? "col-resize" : "row-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={cn(
        "relative group h-full w-full rounded-xl flex flex-col overflow-hidden",
        isEditMode && "ring-2 ring-dashed ring-primary/30 cursor-default",
        isDragging && "opacity-30",
        isBlinking && "ring-4 ring-red-500 ring-opacity-100"
      )}
    >
      {isEditMode && (
        <>
          {onResizeCommit && (
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, "width")}
              className="absolute top-0 bottom-0 -right-1 w-4 z-30 cursor-col-resize flex items-center justify-center group/handle hover:bg-primary/10 rounded-r-md transition-colors"
              title="Arrastrar para cambiar ancho"
            >
              <div className="w-1 h-8 bg-gray-300 rounded-full group-hover/handle:bg-primary transition-colors" />
            </div>
          )}

          {onResizeCommit && (
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
      <div className="h-full w-full flex-1 flex flex-col min-h-0 relative">
        <Component {...widgetConfig} />
      </div>
    </div>
  );
}

function SortableWidget({
  widget,
  isEditMode,
  onRemove,
  onResizeCommit,
  onConfigure,
  isMobile,
  colWidth,
}: {
  widget: WidgetConfig;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onResizeCommit: (id: string, newSpan: number, dimension: "width" | "height") => void;
  onConfigure: (widget: WidgetConfig) => void;
  isMobile: boolean;
  colWidth: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditMode });

  // We keep a ref to the wrapper so WidgetItem can update its gridColumn directly
  const wrapperRef = useRef<HTMLDivElement>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: isMobile ? "span 1" : `span ${widget.colSpan || 6} / span ${widget.colSpan || 6}`,
    gridRow: isMobile ? "auto" : `span ${widget.rowSpan || 4} / span ${widget.rowSpan || 4}`,
    height: isMobile ? "auto" : "100%",
    marginBottom: isMobile ? "1rem" : undefined,
  };

  return (
    <div ref={setRefs} style={style} className="relative h-full">
      <WidgetItem
        widget={widget}
        isEditMode={isEditMode}
        onRemove={onRemove}
        onResizeCommit={onResizeCommit}
        onConfigure={onConfigure}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        wrapperRef={wrapperRef}
        colWidth={colWidth}
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
  
  // Use persistent store with safety check
  const { widgets: rawWidgets, activeCollectionId } = useDashboardLayoutStore();
  const widgets = Array.isArray(rawWidgets) ? rawWidgets : [];
  const { setWidgets, updateWidgetLayout, updateWidgetConfig, setActiveCollectionId, resetLayout: resetStoreLayout } = useDashboardLayoutActions();

  // Compute colWidth from the grid container width
  const gridRef = useRef<HTMLDivElement>(null);
  const getColWidth = () => {
    if (gridRef.current) return gridRef.current.getBoundingClientRect().width / 6;
    return 200; // fallback
  };
  const [colWidth, setColWidth] = useState(200);
  useEffect(() => {
    const update = () => setColWidth(getColWidth());
    const observer = new ResizeObserver(update);
    if (gridRef.current) observer.observe(gridRef.current);
    update();
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);
  
  const { user } = useAuth();
  const isAdminUser = user?.email === "admin@dixai.net";

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
    const newLayout: WidgetConfig[] = (template.layout || []).map((item: any) => ({
      id: item.id,
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
        // We already display widgets from local store.
        // We fetch from server to check for updates or initial load if local is empty (handled by default in store).
        const collectionsRaw = await dashboardService.getCollections();
        const collections = Array.isArray(collectionsRaw) ? collectionsRaw : collectionsRaw?.collections || [];
        const activeCollection = collections.find((c: any) => c.is_active);

        if (activeCollection) {
          // If server has a collection, we update our local store to match
          // Optional: Only if local is "dirty"? For now, server authority on load seems safer to keep sync.
          // BUT user wants speed. If we overwrite immediately, we might cause a jump.
          // Let's only overwrite if we strictly rely on server.
          // User request: "guardes en cache... y si no han habido cambios...".
          // Strategy: Use local cache immediately. Fetch server. If server is different, update? 
          // For now, let's update store, it will trigger re-render efficiently.
          setWidgets((activeCollection.layout || []) as WidgetConfig[]);
          setActiveCollectionId(activeCollection.id);
        } else {
            // No active collection on server.
            // If we have nothing in store, set default? Store already has default.
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
        setTemplates(Array.isArray(data) ? data : data?.templates || []);
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
      // Only auto-save if we have synced with server at least once (to avoid overwriting server with stale local default)
      // and we have an active collection.
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

    // Debounce auto-save
    const timer = setTimeout(() => { autoSave(); }, 2000);
    return () => clearTimeout(timer);
  }, [widgets, isServerSynced, activeCollectionId, isSaving, isMounted]);

  const handleSaveGlobalDefaults = async () => {
    if (!isAdminUser) return;
    setIsSaving(true);
    let errorCount = 0;
    
    // Toast notification
    const toastId = toast.loading("Aplicando configuración como Default Global...");

    try {
      for (const widget of widgets) {
        const typeDefinition = WIDGET_REGISTRY[widget.type];
        if (!typeDefinition) continue;

        try {
          // Attempt to update definition API directly tracking widget boundaries
          await dashboardService.updateDefinition(widget.type, {
             default_col_span: widget.colSpan || typeDefinition.defaultColSpan,
             default_row_span: widget.rowSpan || typeDefinition.defaultRowSpan || 4
          });
        } catch (e) {
          errorCount++;
          console.error(`Error procesando configuración base para ${widget.type}:`, e);
        }
      }

      if (errorCount === 0) {
        toast.success("¡Diseño global actualizado con éxito!", { id: toastId });
      } else {
         toast.error(`Ajustes globales completados con ${errorCount} fallos.`, { id: toastId });
      }
    } catch(globalError) {
      console.error(globalError);
      toast.error("Error catastrofico guardando los ajustes globales.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

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
        // We need a helper for arrayMove with the store setters, or just calculate new array and set it
        // Since arrayMove returns a new array, we can use setWidgets
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
    const def = WIDGET_REGISTRY[type];
    
    // Auto-layout logic for incoming widgets 
    const maxCols = 6; // Total grid columns constraint
    let nextColSpan = def.defaultColSpan;
    
    // Ensure the new widget doesn't inherently exceed max grid size
    if (nextColSpan > maxCols) {
        nextColSpan = maxCols;
    }
    
    // Calculate occupied space in the last row to avoid breaking layouts
    let currentOccupiedInRow = 0;
    if (widgets.length > 0) {
      // Very basic heuristic: sum colSpans until we hit 48, then reset. Find what's left in the final theoretical row.
      let runningSum = 0;
      widgets.forEach(w => {
         runningSum += (w.colSpan || 6);
         if (runningSum >= maxCols) {
            // It either filled the row perfectly or overflowed to a new one. 
            // We just keep the remainder.
            runningSum = runningSum % maxCols;
         }
      });
      currentOccupiedInRow = runningSum;
    }
    
    // If adding this widget exceeds the row, and it's not a full-width widget, try to shrink it to fit the gap,
    // OR if the gap is too small (< minColSpan), let it wrap to a new row at its preferred size.
    const spaceLeftInRow = maxCols - currentOccupiedInRow;
    const minCols = def.minColSpan || 1;
    
    if (currentOccupiedInRow > 0 && spaceLeftInRow < nextColSpan) {
       // It doesn't fit with its default size.
       if (spaceLeftInRow >= minCols) {
          // But it CAN fit if we shrink it.
          nextColSpan = spaceLeftInRow;
       } 
       // If spaceLeftInRow < minCols, it will naturally wrap to the next row at its def.defaultColSpan
    }
    
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type,
      colSpan: nextColSpan,
      rowSpan: def.defaultRowSpan || 4,
    };
    
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => setWidgets(widgets.filter((w) => w.id !== id));

  const handleResize = (id: string, newSpan: number, dimension: "width" | "height") => {
    // Find definition from local registry
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    
    const def = WIDGET_REGISTRY[widget.type];
    
    if (dimension === "width") {
        const minW = def?.minColSpan || 1;
        updateWidgetLayout(id, { colSpan: Math.max(minW, Math.min(6, newSpan)) });
    } else {
        const minH = def?.minRowSpan || 2;
        updateWidgetLayout(id, { rowSpan: Math.max(minH, newSpan) });
    }
  };

  const autoLayoutWidgets = () => {
    const maxCols = 6;
    let currentRow: WidgetConfig[] = [];
    let currentOccupied = 0;
    let newLayout: WidgetConfig[] = [];

    widgets.forEach((w) => {
      const def = WIDGET_REGISTRY[w.type] || { defaultColSpan: 2, minColSpan: 1 };
      let preferred = def.defaultColSpan > maxCols ? maxCols : def.defaultColSpan;
      const minSpace = def.minColSpan || 1;
      
      const spaceLeft = maxCols - currentOccupied;

      if (currentOccupied > 0 && spaceLeft < preferred) {
        if (spaceLeft >= minSpace) {
          // Shrink to fit the remaining gap
          const flexedWidget = { ...w, colSpan: spaceLeft };
          newLayout.push(flexedWidget);
          currentOccupied = 0;
          currentRow = [];
        } else {
          // Cannot fit, must wrap.
          // Distribute the remaining dead space to the LAST widget of the current row so it flushes right cleanly
          if (currentRow.length > 0 && spaceLeft > 0) {
             const lastWidget = newLayout[newLayout.length - 1];
             lastWidget.colSpan = (lastWidget.colSpan || 2) + spaceLeft;
          }
          // Now place current widget on new row
          const wrappedWidget = { ...w, colSpan: preferred };
          newLayout.push(wrappedWidget);
          currentOccupied = preferred % maxCols;
          if (currentOccupied === 0) {
            currentRow = [];
          } else {
            currentRow = [wrappedWidget];
          }
        }
      } else {
        // Fits normally without constraints
        const normalWidget = { ...w, colSpan: preferred };
        newLayout.push(normalWidget);
        currentOccupied = (currentOccupied + preferred) % maxCols;
        if (currentOccupied === 0) {
          currentRow = [];
        } else {
          currentRow.push(normalWidget);
        }
      }
    });

    setWidgets(newLayout);
  };

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  if (!isMounted) {
    // Return a lightweight placeholder or the "skeleton" structure if possible.
    // Since we can't render DndContext on server, we must wait.
    // BUT this wait is now ~100ms (hydration) instead of 5s (API).
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
                    setWidgets(DEFAULT_LAYOUT);
                    setIsEditMode(false);
                    toast.success("Diseño restablecido al predeterminado");
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
                              <p className="text-xs text-secondary mt-1">{(template.layout || []).length} widgets</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={autoLayoutWidgets} variant="outline" size="sm" className="text-[var(--color-foreground)] border-[var(--color-beige)] bg-[var(--color-background)] hover:bg-beige hover:text-[var(--color-foreground)]">
                <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
                Ordenar
              </Button>
              <Button onClick={() => setShowAddWidget(true)} size="sm" className="bg-primary text-white">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Añadir Widget
              </Button>
            </>
          )}
          {isEditMode && isAdminUser && (
             <Button onClick={handleSaveGlobalDefaults} variant="outline" size="sm" className={cn("text-yellow-600 border-yellow-200 bg-[var(--color-background)] hover:bg-yellow-50 hover:text-yellow-700")} disabled={isSaving}>
               <LayoutTemplate className={cn("mr-1.5 h-3.5 w-3.5", isSaving && "animate-spin")} />
               Predeterminada Global
             </Button>
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
              {Object.values(WIDGET_REGISTRY).map((def) => {
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
          <div ref={gridRef} className={cn("grid gap-4", isMobile ? "grid-cols-1 auto-rows-auto" : "auto-rows-[50px]")} style={isMobile ? {} : { gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
            {widgets.map((widget) => (
              <SortableWidget key={widget.id} widget={widget} isEditMode={isEditMode} onRemove={removeWidget} onResizeCommit={handleResize} onConfigure={handleConfigureWidget} isMobile={isMobile} colWidth={colWidth} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeWidget ? (
            <div style={{ width: "100%", height: "100%", cursor: "grabbing" }}>
               <WidgetItem widget={activeWidget} isEditMode={isEditMode} isDragging colWidth={colWidth} />
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
