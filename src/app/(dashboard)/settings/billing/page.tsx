"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import Button from "@/components/Button";
import { billing } from "@/services/api";
import { Crown, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function BillingPage() {
  const [config, setConfig] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configData, plansData] = await Promise.all([
        billing.getConfig(),
        billing.getPlans(),
      ]);
      setConfig(configData);
      setPlans(plansData?.plans || []);
    } catch (error) {
      console.error("Error loading billing data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-primary text-lg">Cargando...</p>
        </div>
      </Card>
    );
  }

  const currentPlan = config?.current_plan || "starter";

  const planBadgeColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    starter: "bg-blue-100 text-blue-700",
    pro: "bg-primary/10 text-primary",
  };

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Planes y Facturación
        </h1>
        <p className="text-lg text-[var(--color-foreground)] opacity-60">
          Gestiona tu suscripción de EscapeMaster Manager.
        </p>
      </div>

      {/* CURRENT PLAN */}
      <Card className="mb-8 p-6 bg-[var(--color-background-soft)] border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex justify-center items-center text-primary">
            <Crown size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Plan Actual:{" "}
              <span className={`capitalize px-3 py-1 rounded-full text-lg ml-1 ${planBadgeColors[currentPlan] || "bg-gray-100 text-gray-700"}`}>
                {currentPlan}
              </span>
            </h2>
            <p className="text-[var(--color-foreground)] opacity-60 mt-1">
              {config?.features?.max_rooms === 999 ? "Salas ilimitadas" : `Hasta ${config?.features?.max_rooms || 3} salas`}
              {" · "}
              {config?.features?.max_users === 999 ? "Usuarios ilimitados" : `Hasta ${config?.features?.max_users || 5} usuarios`}
            </p>
          </div>
        </div>
      </Card>

      {/* PLANS */}
      <h2 className="text-2xl font-bold text-primary mb-4 mt-12">
        Nuestros Planes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan: any) => {
          const isCurrentPlan = plan.id === currentPlan;
          const isPro = plan.id === "pro";
          return (
            <Card
              key={plan.id}
              className={`p-8 flex flex-col justify-between hover:translate-y-0 ${
                isCurrentPlan ? "border-primary ring-2 ring-primary/20" : ""
              } ${isPro ? "border-2 border-primary bg-primary/5" : ""}`}
            >
              <div>
                {isPro && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                    <Sparkles size={12} /> Recomendado
                  </div>
                )}
                <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-extrabold text-[var(--color-foreground)]">
                    {plan.price_monthly}€
                  </span>
                  <span className="text-lg font-medium text-[var(--color-foreground)] opacity-80">
                    /mes
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {(plan.features || []).map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                      <CheckCircle2 className="text-green-500 shrink-0" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full group"
                variant={isCurrentPlan ? "outline" : "primary"}
                disabled={isCurrentPlan}
                onClick={() => {
                  if (!isCurrentPlan) {
                    alert("Para cambiar de plan, contacta con soporte@escapemaster.es");
                  }
                }}
              >
                {isCurrentPlan ? (
                  "Plan Actual"
                ) : (
                  <>
                    Cambiar a {plan.name}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-[var(--color-light)] rounded-lg text-sm text-[var(--color-foreground)] opacity-70">
        Para cambiar de plan o gestionar la facturación, contacta con nuestro equipo en{" "}
        <a href="mailto:soporte@escapemaster.es" className="text-primary underline">
          soporte@escapemaster.es
        </a>
      </div>
    </div>
  );
}
