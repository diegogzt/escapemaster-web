"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import { auth, billing } from "@/services/api";
import { Crown, Plug, CheckCircle2, ArrowRight } from "lucide-react";

export default function BillingPage() {
  const [config, setConfig] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stripe Connect State
  const [connectStatus, setConnectStatus] = useState<any>(null);
  const [loadingConnect, setLoadingConnect] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load current user/org info
      const userData = await auth.me();
      // Wait, let's assume `organization` is returned or we fetch it.
      // Usually auth.me returns `{ user, organization }` or similar.
      setOrg(userData.organization || userData);

      // Load billing config from API
      const configData = await billing.getConfig();
      setConfig(configData);

      // Load Connect Status
      try {
        const connectRes = await billing.getConnectStatus();
        setConnectStatus(connectRes);
      } catch (e) {
        console.error("No connect status", e);
      }
    } catch (error) {
      console.error("Error loading billing data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOnboarding = async () => {
    try {
      setLoadingConnect(true);
      const res = await billing.createConnectOnboarding({
        return_url: window.location.origin + "/settings/billing?connect=return",
        refresh_url: window.location.origin + "/settings/billing?connect=refresh",
      });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error("Connect onboarding error:", error);
      alert("No se pudo iniciar la conexión con Stripe.");
    } finally {
      setLoadingConnect(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!priceId) {
      alert("El precio no está configurado por el superadmin.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await billing.createCheckoutSession({
        price_id: priceId,
        success_url: window.location.origin + "/settings/billing?success=true",
        cancel_url: window.location.origin + "/settings/billing?canceled=true",
      });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("No se pudo iniciar la sesión de pago.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !config) {
    return (
      <Card className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-primary text-lg">Cargando...</p>
        </div>
      </Card>
    );
  }

  const currentPlan = org?.subscription_tier || "none";

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Planes y Facturación</h1>
        <p className="text-lg text-[var(--color-foreground)] opacity-60">
          Gestiona tu suscripción y plugins de EscapeMaster.
        </p>
      </div>

      {/* CURRENT PLAN */}
      <Card className="mb-8 p-6 bg-[var(--color-background-soft)] border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex justify-center items-center text-primary">
            <Crown size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Plan Actual: <span className="capitalize text-primary">{currentPlan}</span></h2>
            <p className="text-[var(--color-foreground)] opacity-60">
              Estado: <span className="font-semibold">{org?.subscription_status || "Inactivo"}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* PLANS */}
      <h2 className="text-2xl font-bold text-primary mb-4 mt-12">Mejora tu cuenta</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* Base Plan */}
        <Card className={`p-8 flex flex-col justify-between ${currentPlan === 'base' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Popular
            </div>
            <h3 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">Base</h3>
            <p className="text-[var(--color-foreground)] opacity-90 mb-6">
              Herramientas esenciales. Coste por conexión ({config.connection_cost}€).
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-extrabold text-[var(--color-foreground)]">{config.base_plan_price}€</span>
              <span className="text-lg font-medium text-[var(--color-foreground)] opacity-80">/mes</span>
            </div>
          </div>
          <Button 
            className="w-full group" 
            variant={currentPlan === 'base' ? 'outline' : 'primary'}
            disabled={currentPlan === 'base'}
            onClick={() => handleSubscribe(config.base_plan_stripe_price_id)}
          >
            {currentPlan === 'base' ? "Plan Actual" : "Suscribirse"}
            {currentPlan !== 'base' && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />}
          </Button>
        </Card>

        {/* Ultra Plan */}
        <Card className={`p-8 border-2 border-primary bg-primary/5 flex flex-col justify-between ${currentPlan === 'ultra' ? 'ring-4 ring-primary/30' : ''}`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              Recomendado
            </div>
            <h3 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">Ultra</h3>
            <p className="text-[var(--color-foreground)] opacity-90 mb-6">
              Todas las herramientas, sin costes por conexión. Incluye todos los plugins.
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-extrabold text-[var(--color-foreground)]">{config.ultra_plan_price}€</span>
              <span className="text-lg font-medium text-[var(--color-foreground)] opacity-80">/mes</span>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                <CheckCircle2 className="text-green-500" size={16} />
                <span>Gestión de plugins gratis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                <CheckCircle2 className="text-green-500" size={16} />
                <span>Soporte prioritario</span>
              </div>
            </div>
          </div>
          <Button 
            className="w-full group" 
            disabled={currentPlan === 'ultra'}
            onClick={() => handleSubscribe(config.ultra_plan_stripe_price_id)}
          >
            {currentPlan === 'ultra' ? "Plan Actual" : "Suscribirse"}
            {currentPlan !== 'ultra' && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />}
          </Button>
        </Card>
      </div>

      {/* PLUGINS */}
      <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2"><Plug size={24} /> Plugins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
          <p className="text-gray-600 mb-4">
            Responde preguntas frecuentes a tus clientes usando un bot de inteligencia artificial entrenado con la información de tus salas de escape.
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div className="font-bold text-lg">{config.plugin_ai_assistant_price}€ / mes</div>
            <Button 
               variant="outline" 
               disabled={currentPlan === 'ultra'}
               onClick={() => handleSubscribe(config.plugin_ai_assistant_stripe_price_id)}
            >
              {currentPlan === 'ultra' ? "Incluido en Ultra" : "Añadir Plugin"}
            </Button>
          </div>
        </Card>
      </div>

      {/* STRIPE CONNECT FOR RECEIVING PAYMENTS */}
      <h2 className="text-2xl font-bold text-primary mb-4 mt-12 border-t border-gray-200 pt-8">Cobros a Clientes</h2>
      <p className="text-[var(--color-foreground)] opacity-70 mb-6">
        Configura tu cuenta bancaria para recibir automáticamente el dinero de las reservas pagadas por tus clientes a través del motor de reservas.
      </p>
      
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cuenta Conectada de Stripe</h3>
            <p className="text-gray-600 mb-4">
              Usamos Stripe para transferirte los pagos de forma segura. Activa los pagos introduciendo tus datos fiscales y tu IBAN.
            </p>
            {connectStatus?.onboarding_complete ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-full w-fit">
                <CheckCircle2 size={20} />
                <span>Cuenta Activa y Recibiendo Pagos</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>Configuración Pendiente</span>
              </div>
            )}
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            {!connectStatus?.onboarding_complete ? (
               <Button 
                onClick={handleConnectOnboarding} 
                className="w-full md:w-auto hover:scale-105 transition-transform"
                disabled={loadingConnect}
              >
                {loadingConnect ? "Redirigiendo..." : "Configurar Cuenta Bancaria"}
              </Button>
            ) : (
              <Button onClick={handleConnectOnboarding} variant="outline" className="w-full md:w-auto">
                Actualizar Datos Bancarios
              </Button>
            )}
          </div>
        </div>
      </Card>

    </div>
  );
}
