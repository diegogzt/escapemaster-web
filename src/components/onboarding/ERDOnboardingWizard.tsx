"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Loader2,
  Mail,
  Lock,
  Database,
  DoorOpen,
  ClipboardList,
  Tags,
  Users,
  ShieldCheck,
  SkipForward,
} from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { cn } from "@/utils";
import {
  erdOnboarding,
  resolveDependencies,
  getMissingDependencies,
  type MigrationModule,
  type ErdPreviewModule,
  type ErdMigrateModuleResult,
} from "@/services/erdOnboarding";
import { MODULE_LABELS, MODULE_ICONS } from "@/services/erdOnboarding";

interface ERDOnboardingWizardProps {
  onComplete: (results: ErdMigrateModuleResult[]) => void;
  onSkip: () => void;
}

type WizardStep = "credentials" | "selection" | "confirmation" | "progress";

const MODULE_CONFIG: Record<
  MigrationModule,
  { icon: React.ElementType; description: string }
> = {
  rooms: {
    icon: DoorOpen,
    description: "Juegos, precios y horarios",
  },
  bookings: {
    icon: ClipboardList,
    description: "Historial completo de reservas y clientes",
  },
  payments: {
    icon: Database,
    description: "Registros de pagos de reservas",
  },
  coupons: {
    icon: Tags,
    description: "Cupones de descuento y tarjetas regalo",
  },
  employees: {
    icon: Users,
    description: "Staff y game masters",
  },
  gdpr: {
    icon: ShieldCheck,
    description: "Registros de consentimiento de clientes",
  },
};

export function ERDOnboardingWizard({
  onComplete,
  onSkip,
}: ERDOnboardingWizardProps) {
  const [step, setStep] = useState<WizardStep>("credentials");

  // Step 1: Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Step 2: Selection
  const [erdSessionId, setErdSessionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ErdPreviewModule[]>([]);
  const [selectedModules, setSelectedModules] = useState<Set<MigrationModule>>(
    new Set(["rooms", "bookings", "payments", "coupons", "employees", "gdpr"]),
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Step 4: Progress
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<ErdMigrateModuleResult[]>([]);
  const [migrationDone, setMigrationDone] = useState(false);

  const resetWizard = useCallback(() => {
    setStep("credentials");
    setEmail("");
    setPassword("");
    setErdSessionId(null);
    setPreview([]);
    setSelectedModules(
      new Set(["rooms", "bookings", "payments", "coupons", "employees", "gdpr"]),
    );
    setResults([]);
    setMigrationDone(false);
    setIsMigrating(false);
    setIsAuthenticating(false);
    setIsLoadingPreview(false);
    setAuthError(null);
  }, []);

  // Step 1: Authenticate
  const handleAuthenticate = async () => {
    if (!email || !password) return;
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const response = await erdOnboarding.authenticate(email, password);
      if (response.success && response.erd_session_id) {
        setErdSessionId(response.erd_session_id);
        setPassword("");

        // Load preview
        setIsLoadingPreview(true);
        setStep("selection");
        const previewData = await erdOnboarding.preview(
          response.erd_session_id,
        );
        setPreview(previewData.modules);
      } else {
        setAuthError(response.message || "Credenciales incorrectas");
      }
    } catch {
      setAuthError("No se pudo conectar con ERD. Verifica tus credenciales.");
    } finally {
      setIsAuthenticating(false);
      setIsLoadingPreview(false);
    }
  };

  // Step 2: Toggle module selection
  const toggleModule = (mod: MigrationModule) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) {
        next.delete(mod);
      } else {
        next.add(mod);
        // Auto-add dependencies
        const resolved = resolveDependencies([...next]);
        return new Set(resolved);
      }
      return next;
    });
  };

  const missingDeps = getMissingDependencies([...selectedModules]);

  // Step 4: Execute migration
  const handleMigrate = async () => {
    if (!erdSessionId || selectedModules.size === 0) return;
    setStep("progress");
    setIsMigrating(true);

    try {
      // Execute migration - may return immediately or after completion
      const execResponse = await erdOnboarding.execute(erdSessionId, [...selectedModules]);

      // If results returned immediately, use them directly
      if (execResponse.results && execResponse.results.length > 0) {
        setResults(execResponse.results);
        setMigrationDone(true);
        setIsMigrating(false);
        if (execResponse.success) {
          toast.success("Migración completada con éxito");
        } else {
          toast.warning("Migración completada con algunos errores");
        }
        return;
      }

      // Otherwise poll for status (migration runs in background)
      const pollInterval = setInterval(async () => {
        try {
          const status = await erdOnboarding.status(erdSessionId);
          if (!status.is_running) {
            clearInterval(pollInterval);
            if (status.results) {
              setResults(status.results);
            }
            if (status.status === "completed") {
              toast.success("Migración completada. Revisa tu email para el resumen.");
            } else if (status.status === "failed") {
              toast.error(status.error_message || "Error en la migración");
            }
            setMigrationDone(true);
            setIsMigrating(false);
          }
        } catch {
          // Continue polling
        }
      }, 3000); // Poll every 3 seconds

      // Safety timeout - stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isMigrating) {
          toast.warning("La migración está tardando más de lo esperado. Recibirás un email cuando termine.");
          setMigrationDone(true);
          setIsMigrating(false);
        }
      }, 300000);

    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || "Error durante la migración";
      toast.error(message);
      setMigrationDone(true);
      setIsMigrating(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    resetWizard();
    onSkip();
  };

  // Handle done after migration
  const handleDone = () => {
    const finalResults = results;
    resetWizard();
    onComplete(finalResults);
  };

  const stepLabels = ["Credenciales", "Selección", "Confirmar", "Migración"];
  const stepKeys: WizardStep[] = ["credentials", "selection", "confirmation", "progress"];
  const currentStepIdx = stepKeys.indexOf(step);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepKeys.map((s, i) => {
          const isActive = step === s;
          const isPast = i < currentStepIdx;
          return (
            <React.Fragment key={s}>
              {i > 0 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded-full transition-colors",
                    isPast ? "bg-primary" : "bg-[var(--color-beige)]",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
                  isActive && "bg-primary text-white",
                  isPast && "bg-primary/10 text-primary",
                  !isActive && !isPast && "text-[var(--color-foreground)] opacity-30",
                )}
              >
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">
                  {isPast ? <Check size={10} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[i]}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[280px]">
        {/* Step 1: Credentials */}
        {step === "credentials" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[var(--color-foreground)] opacity-70">
                Introduce tus credenciales de ERD (erdpanel.com) para conectar
                y migrar tus datos existentes.
              </p>
            </div>
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-30 mt-3"
                />
                <Input
                  label="Email ERD"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  className="pl-10"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-foreground)] opacity-30 mt-3"
                />
                <Input
                  label="Contraseña ERD"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  className="pl-10"
                  placeholder="Tu contraseña"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") handleAuthenticate();
                  }}
                />
              </div>
              {authError && (
                <p className="text-sm text-red-500 text-center">{authError}</p>
              )}
              <p className="text-[10px] text-[var(--color-foreground)] opacity-40 text-center">
                Tus credenciales solo se usan para conectar temporalmente con ERD.
                No se almacenan.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Selection */}
        {step === "selection" && (
          <div className="space-y-4">
            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2
                  size={32}
                  className="animate-spin text-primary mb-3"
                />
                <p className="text-sm text-[var(--color-foreground)] opacity-60">
                  Cargando datos de ERD...
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[var(--color-foreground)] opacity-60 mb-4">
                  Selecciona los módulos que quieres migrar. Las dependencias
                  se marcarán automáticamente.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {preview.map((mod) => {
                    const config =
                      MODULE_CONFIG[mod.module as MigrationModule];
                    if (!config) return null;
                    const isSelected = selectedModules.has(
                      mod.module as MigrationModule,
                    );
                    const Icon = config.icon;
                    const isDependency =
                      !selectedModules.has(mod.module as MigrationModule) &&
                      missingDeps.some((d) => d.requires === mod.module);

                    return (
                      <button
                        key={mod.module}
                        type="button"
                        onClick={() =>
                          toggleModule(mod.module as MigrationModule)
                        }
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                            : "border-[var(--color-beige)] hover:border-primary/30",
                          isDependency && "border-amber-400/50 bg-amber-50/30",
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg shrink-0",
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-[var(--color-background-soft)] text-[var(--color-foreground)] opacity-50",
                          )}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--color-foreground)]">
                              {MODULE_LABELS[mod.module as MigrationModule]}
                            </span>
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                              {mod.count}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-foreground)] opacity-50 mt-0.5">
                            {config.description}
                          </p>
                          {mod.depends_on.length > 0 && (
                            <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              Requiere:{" "}
                              {mod.depends_on
                                .map(
                                  (d) =>
                                    MODULE_LABELS[d as MigrationModule] || d,
                                )
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirmation" && (
          <div className="space-y-6">
            <div className="bg-[var(--color-background-soft)] rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-[var(--color-foreground)] text-sm mb-3">
                Resumen de migración
              </h3>
              {[...selectedModules].map((mod) => {
                const config = MODULE_CONFIG[mod];
                const previewMod = preview.find((p) => p.module === mod);
                const Icon = config.icon;
                return (
                  <div
                    key={mod}
                    className="flex items-center justify-between py-2 border-b border-[var(--color-beige)] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-primary" />
                      <span className="text-sm font-medium text-[var(--color-foreground)]">
                        {MODULE_LABELS[mod]}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {previewMod?.count || 0} registros
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-start gap-2 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl">
              <AlertTriangle
                size={16}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-800">
                Los registros que ya existan (mismo erd_id) no se duplicarán.
                La migración es segura para ejecutar múltiples veces.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Progress */}
        {step === "progress" && (
          <div className="space-y-4">
            {isMigrating && !migrationDone && (
              <div className="text-center mb-4">
                <Loader2
                  size={28}
                  className="animate-spin text-primary mx-auto mb-2"
                />
                <p className="text-sm text-[var(--color-foreground)] opacity-60">
                  Migrando datos desde ERD...
                </p>
              </div>
            )}
            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((r) => {
                  const config = MODULE_CONFIG[r.module as MigrationModule];
                  const Icon = config?.icon || Database;
                  return (
                    <div
                      key={r.module}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-beige)] bg-[var(--color-background-soft)]"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          r.status === "completed" && "bg-green-100 text-green-600",
                          r.status === "partial" && "bg-amber-100 text-amber-600",
                          r.status === "error" && "bg-red-100 text-red-600",
                        )}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--color-foreground)]">
                            {MODULE_LABELS[r.module as MigrationModule] || r.module}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                              r.status === "completed" && "bg-green-100 text-green-700",
                              r.status === "partial" && "bg-amber-100 text-amber-700",
                              r.status === "error" && "bg-red-100 text-red-700",
                            )}
                          >
                            {r.status === "completed"
                              ? "Completado"
                              : r.status === "partial"
                                ? "Parcial"
                                : "Error"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-foreground)] opacity-50">
                          {r.migrated} migrados, {r.skipped} omitidos
                          {r.errors.length > 0 && `, ${r.errors.length} errores`}
                        </p>
                        {r.errors.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {r.errors.map((err, i) => (
                              <li
                                key={i}
                                className="text-[10px] text-red-400 truncate"
                                title={err}
                              >
                                {err}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {r.status === "completed" && (
                        <Check size={18} className="text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {migrationDone && (
              <div className="text-center pt-4">
                <p className="text-sm text-[var(--color-foreground)] opacity-70">
                  Migración finalizada. Continúa para ver tus datos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-beige)]">
        <div className="flex gap-2">
          {step !== "credentials" && step !== "progress" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(stepKeys[currentStepIdx - 1])}
            >
              <ArrowLeft size={16} className="mr-1" />
              Atrás
            </Button>
          )}
          {step === "credentials" && (
            <Button variant="outline" size="sm" onClick={handleSkip}>
              <SkipForward size={16} className="mr-1" />
              Omitir por ahora
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {step === "credentials" && (
            <Button
              size="sm"
              onClick={handleAuthenticate}
              disabled={!email || !password || isAuthenticating}
              loading={isAuthenticating}
            >
              Conectar con ERD
              <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
          {step === "selection" && (
            <Button
              size="sm"
              onClick={() => setStep("confirmation")}
              disabled={selectedModules.size === 0 || isLoadingPreview}
            >
              Continuar
              <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
          {step === "confirmation" && (
            <Button size="sm" onClick={handleMigrate} disabled={isMigrating}>
              Iniciar Migración
              <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
          {step === "progress" && migrationDone && (
            <Button size="sm" onClick={handleDone}>
              Continuar
              <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
