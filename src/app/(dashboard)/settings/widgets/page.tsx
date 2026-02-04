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
          <div className="col-span-1 text-center font-bold text-xs uppercase tracking-wider">Def Col</div>
          <div className="col-span-1 text-center font-bold text-xs uppercase tracking-wider">Def Row</div>
          <div className="col-span-1 text-center font-bold text-xs uppercase tracking-wider">Min Col</div>
          <div className="col-span-1 text-center font-bold text-xs uppercase tracking-wider">Min Row</div>
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
  const [defCol, setDefCol] = useState(definition.default_col_span || 12);
  const [defRow, setDefRow] = useState(definition.default_row_span || 8);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Update state when incoming definition changes
  useEffect(() => {
    setMinCol(definition.min_col_span || 1);
    setMinRow(definition.min_row_span || 1);
    setDefCol(definition.default_col_span || 12);
    setDefRow(definition.default_row_span || 8);
  }, [definition]);

  // Reset success state after 2s
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const hasChanges = 
    minCol !== (definition.min_col_span || 1) || 
    minRow !== (definition.min_row_span || 1) ||
    defCol !== (definition.default_col_span || 12) ||
    defRow !== (definition.default_row_span || 8);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await dashboardService.updateDefinition(definition.id, {
        min_col_span: minCol,
        min_row_span: minRow,
        default_col_span: defCol,
        default_row_span: defRow
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
      <div className="col-span-4">
        <h3 className="font-semibold text-[var(--color-heading)] truncate" title={definition.name}>{definition.name}</h3>
        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block truncate max-w-full">
          {definition.slug}
        </span>
      </div>
      
      {/* Inputs Grid */}
      <div className="col-span-8 grid grid-cols-4 gap-4">
        <Input 
          type="number" 
          min={1} 
          max={48} 
          value={defCol} 
          onChange={(e) => setDefCol(parseInt(e.target.value) || 1)}
          wrapperClassName="mb-0"
          className="text-center h-9 text-sm"
          title="Default Column Span"
        />
        <Input 
          type="number" 
          min={1} 
          max={48} 
          value={defRow} 
          onChange={(e) => setDefRow(parseInt(e.target.value) || 1)}
          wrapperClassName="mb-0"
          className="text-center h-9 text-sm"
          title="Default Row Span"
        />
        <Input 
          type="number" 
          min={1} 
          max={48} 
          value={minCol} 
          onChange={(e) => setMinCol(parseInt(e.target.value) || 1)}
          wrapperClassName="mb-0"
          className="text-center h-9 text-sm"
          title="Min Column Span"
        />
        
        <div className="relative">
          <Input 
            type="number" 
            min={1} 
            max={48} 
            value={minRow} 
            onChange={(e) => setMinRow(parseInt(e.target.value) || 1)}
            wrapperClassName="mb-0"
            className="text-center h-9 text-sm"
            title="Min Row Span"
          />
          
          {/* Floating Action Button */}
          {(hasChanges || isSuccess) && (
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
               {isSuccess ? (
                  <div className="bg-green-100 text-green-600 p-1.5 rounded-full shadow-md animate-in zoom-in border border-green-200">
                    <CheckCircle2 size={16} />
                  </div>
               ) : (
                  <Button 
                     type="button"
                     size="sm" 
                     variant="primary" 
                     className="h-8 w-8 p-0 rounded-full shadow-md" 
                     onClick={handleSave}
                     loading={isSaving}
                     title="Save Changes"
                  >
                     <Save size={14} />
                  </Button>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
