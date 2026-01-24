"use client";

import { useEffect, useState } from "react";
import { widgets as dashboardService, WidgetDefinition } from "@/services/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WidgetSettingsPage() {
  const [definitions, setDefinitions] = useState<WidgetDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await dashboardService.getWidgetDefinitions();
      setDefinitions(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load widget definitions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-heading)]">Widget Configuration</h1>
        <p className="text-[var(--color-muted-foreground)] mt-2">
          Configure global minimum dimensions for dashboard widgets to ensure optimal display.
        </p>
      </div>

      <div className="bg-[var(--color-background)] rounded-xl shadow-sm border border-[var(--color-beige)] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-beige)] bg-[var(--color-background-soft)] font-medium text-sm text-[var(--color-muted-foreground)]">
          <div className="col-span-5">Widget Details</div>
          <div className="col-span-3">Component Identifier</div>
          <div className="col-span-2 text-center">Min Columns</div>
          <div className="col-span-2 text-center">Min Rows</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--color-beige)]">
          {definitions.map((def) => (
            <WidgetRow 
                key={def.id} 
                definition={def} 
                onSave={() => fetchDefinitions(true)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetRow({ definition, onSave }: { definition: WidgetDefinition, onSave?: () => void }) {
  const [minCol, setMinCol] = useState(definition.min_col_span || 1);
  const [minRow, setMinRow] = useState(definition.min_row_span || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Update state when incoming definition changes (after successful refresh)
  useEffect(() => {
    setMinCol(definition.min_col_span || 1);
    setMinRow(definition.min_row_span || 1);
  }, [definition.min_col_span, definition.min_row_span]);

  // Reset success state after 2s
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const hasChanges = 
    minCol !== (definition.min_col_span || 1) || 
    minRow !== (definition.min_row_span || 1);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await dashboardService.updateDefinition(definition.id, {
        min_col_span: minCol,
        min_row_span: minRow
      });
      setIsSuccess(true);
      if (onSave) onSave();
    } catch (e) {
      console.error(e);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--color-background-soft)] transition-colors group">
      <div className="col-span-5">
        <h3 className="font-semibold text-[var(--color-heading)]">{definition.name}</h3>
        <p className="text-sm text-[var(--color-muted-foreground)]">{definition.description || "No description"}</p>
        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
          {definition.slug}
        </span>
      </div>
      
      <div className="col-span-3">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 block truncate" title={definition.component_path}>
          {definition.component_path}
        </code>
      </div>

      <div className="col-span-2 px-4">
        <Input 
          type="number" 
          min={1} 
          max={12} 
          value={minCol} 
          onChange={(e) => setMinCol(parseInt(e.target.value) || 1)}
          wrapperClassName="mb-0"
          className="text-center h-10"
        />
      </div>

      <div className="col-span-2 px-4 relative flex items-center justify-center gap-2">
        <Input 
          type="number" 
          min={1} 
          max={12} 
          value={minRow} 
          onChange={(e) => setMinRow(parseInt(e.target.value) || 1)}
          wrapperClassName="mb-0"
          className="text-center h-10"
        />
        
        {/* Floating Action Button for Row */}
        {(hasChanges || isSuccess) && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center">
             {isSuccess ? (
                <div className="bg-green-100 text-green-600 p-2 rounded-full shadow-sm animate-in zoom-in">
                  <CheckCircle2 size={18} />
                </div>
             ) : (
                <Button 
                   type="button"
                   size="sm" 
                   variant="primary" 
                   className="h-10 w-10 p-0 rounded-full shadow-md" 
                   onClick={handleSave}
                   loading={isSaving}
                   title="Save Changes"
                >
                   <Save size={18} />
                </Button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
