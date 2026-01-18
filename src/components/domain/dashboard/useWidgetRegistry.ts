"use client";

import { useEffect, useState } from "react";
import { widgets as dashboardService, type WidgetDefinition as APIWidgetDefinition } from "@/services/api";
import { WIDGET_REGISTRY } from "./widget-registry";
import { WidgetDefinition, WidgetConfigOptions } from "./types";

interface SyncedWidgetRegistry {
  [key: string]: WidgetDefinition;
}

/**
 * Hook to sync widget registry with API definitions
 * Falls back to local registry if API fails
 */
export function useWidgetRegistry() {
  const [registry, setRegistry] = useState<SyncedWidgetRegistry>(WIDGET_REGISTRY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncRegistry = async () => {
      try {
        const apiDefinitions = await dashboardService.getWidgetDefinitions();
        
        // Merge API definitions with local registry
        // API can override default_config, but components come from local registry
        const mergedRegistry: SyncedWidgetRegistry = { ...WIDGET_REGISTRY };
        
        apiDefinitions.forEach((apiDef: APIWidgetDefinition) => {
          const localDef = WIDGET_REGISTRY[apiDef.slug];
          if (localDef) {
            // Merge API config with local definition
            mergedRegistry[apiDef.slug] = {
              ...localDef,
              title: apiDef.name || localDef.title,
              description: apiDef.description || localDef.description,
              defaultConfig: {
                ...localDef.defaultConfig,
                ...(apiDef.default_config as WidgetConfigOptions),
              },
            };
          }
          // Note: If widget exists in API but not locally, we can't render it
          // since we don't have the component. This is intentional.
        });
        
        setRegistry(mergedRegistry);
        setError(null);
      } catch (err) {
        console.warn("Failed to sync widget registry from API, using local registry", err);
        setError("Error syncing with API");
        // Keep using local registry as fallback
      } finally {
        setIsLoading(false);
      }
    };

    syncRegistry();
  }, []);

  return { registry, isLoading, error };
}

/**
 * Get the list of available widget types from the registry
 */
export function getAvailableWidgetTypes(registry: SyncedWidgetRegistry): string[] {
  return Object.keys(registry);
}

/**
 * Check if a widget type is available in the registry
 */
export function isWidgetAvailable(registry: SyncedWidgetRegistry, type: string): boolean {
  return type in registry;
}
