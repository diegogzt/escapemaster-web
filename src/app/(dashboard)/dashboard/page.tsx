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
} from "lucide-react";
import Button from "@/components/Button";
import { WIDGET_REGISTRY } from "@/components/domain/dashboard/widget-registry";
import { WidgetConfig, WidgetType } from "@/components/domain/dashboard/types";
import { cn } from "@/utils";
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
  dragHandleProps?: any;
  style?: React.CSSProperties;
  isDragging?: boolean;
}) {
  const def = WIDGET_REGISTRY[widget.type];
  const [isBlinking, setIsBlinking] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  if (!def) return null;
  const Component = def.component;

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
              className="p-1 hover:bg-gray-100 rounded-full cursor-grab active:cursor-grabbing"
              title="Arrastrar"
            >
              <GripVertical className="h-4 w-4 text-gray-600" />
            </button>
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
        <Component />
      </div>
    </div>
  );
}

function SortableWidget({
  widget,
  isEditMode,
  onRemove,
  onResize,
}: {
  widget: WidgetConfig;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onResize: (
    id: string,
    newSpan: number,
    dimension: "width" | "height"
  ) => void;
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
    <div className="space-y-8 relative min-h-screen pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-dark">
            Dashboard
          </h2>
          <p className="text-secondary mt-1">
            Bienvenido de nuevo, aquí tienes el resumen de hoy.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditMode && (
            <>
              <Button
                variant="outline"
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
                className="bg-white text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Restablecer
              </Button>
              <Button
                onClick={resetLayout}
                variant="outline"
                className="text-dark border-gray-300 bg-white hover:bg-gray-50"
              >
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Ordenar
              </Button>
              <Button
                onClick={() => setShowAddWidget(true)}
                className="bg-primary text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir Widget
              </Button>
            </>
          )}
          <Button
            variant={isEditMode ? "primary" : "outline"}
            onClick={toggleEditMode}
            className={isEditMode ? "bg-accent text-dark border-accent" : ""}
          >
            {isEditMode ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Settings className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Finalizar Edición" : "Configurar"}
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
    </div>
  );
}
