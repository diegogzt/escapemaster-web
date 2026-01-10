"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import {
  Globe,
  Mail,
  MapPin,
  Phone,
  Building,
  CreditCard,
  Palette,
  Layout,
  Moon,
  Sun,
  Shield,
  Zap,
  Share2,
  LifeBuoy,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Smartphone,
  Calendar as CalendarIcon,
  MessageSquare,
  Sparkles,
  Lock,
  ArrowRight,
  Users,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const themesList = [
  { id: "tropical", name: "Tropical", primary: "#1F6357", secondary: "#4DB8A8" },
  { id: "ocean", name: "Ocean", primary: "#006D77", secondary: "#83C5BE" },
  { id: "sunset", name: "Sunset", primary: "#FF6B9D", secondary: "#FFA07A" },
  { id: "nature", name: "Nature", primary: "#2D6A4F", secondary: "#52B788" },
  { id: "mint", name: "Mint Fresh", primary: "#1F756E", secondary: "#5DDCC3" },
  { id: "vista", name: "Vista", primary: "#D56A34", secondary: "#3F170E" },
  { id: "twilight", name: "Twilight", primary: "#4338CA", secondary: "#6B7280" },
  { id: "lavender", name: "Lavender", primary: "#9D84B7", secondary: "#C8B6E2" },
  { id: "fire", name: "Fire", primary: "#FF4500", secondary: "#FFD700" },
];

export default function SettingsPage() {
  const { 
    theme, 
    setTheme, 
    isDarkMode,
    setIsDarkMode
  } = useTheme();

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Ajustes de Organización</h1>
        <p className="text-lg text-[var(--color-foreground)] opacity-60">
          Gestiona los detalles y la configuración de tu empresa.
        </p>
      </div>

      <div className="space-y-10">
        {/* Personalization Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              Personalización Visual
            </h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Tema y Colores</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-8">
              {/* Palette Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] opacity-80 mb-4">
                  Selecciona la paleta de colores de tu organización
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as any)}
                      aria-label={`Seleccionar tema ${t.name}`}
                      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === t.id
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                          : "border-[var(--color-beige)] hover:border-primary/30"
                      }`}
                    >
                      <div className="flex gap-1 mb-3 pointer-events-none">
                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.primary }} />
                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.secondary }} />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-foreground)] pointer-events-none">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background-soft)]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">Modo Oscuro</h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-60">{isDarkMode ? 'Activado' : 'Desactivado'}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Toggle modo oscuro"
                    className={`w-14 h-8 rounded-full transition-all relative outline-hidden ${isDarkMode ? 'bg-indigo-600' : 'bg-[var(--color-background-soft)]'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-[var(--color-background)] rounded-full shadow-md transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Organization Info Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Datos Generales</h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Información de la Organización</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nombre de la Organización" defaultValue="Mi Escape Room" />
              <Input label="Sitio Web" defaultValue="https://miescaperoom.com" />
              <Input label="Correo Electrónico de Contacto" defaultValue="contacto@miescaperoom.com" />
              <Input label="Teléfono" defaultValue="+34 912 345 678" />
            </div>
          </Card>
        </section>

        {/* Location Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)] ">Ubicación</h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)]  border-[var(--color-beige)] ">
            <CardHeader>
              <CardTitle className="">Dirección y Horario</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Dirección Completa"
                  defaultValue="Calle Principal 123, Local Bajo"
                />
              </div>
              <div>
                <Input label="Código Postal" defaultValue="28001" />
              </div>
              <div>
                <Input label="Ciudad" defaultValue="Madrid" />
              </div>
              <div>
                <Input label="Provincia/Estado" defaultValue="Madrid" />
              </div>
              <div>
                <Select label="Zona Horaria" defaultValue="Europe/Madrid">
                  <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">
                    America/New_York (GMT-5)
                  </option>
                </Select>
              </div>
            </div>
          </Card>
        </section>

        {/* Integrations Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              Ecosistema e Integraciones
            </h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Servicios Conectados</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Stripe", desc: "Pagos y suscripciones", icon: CreditCard, color: "text-indigo-600", active: true },
                { name: "WhatsApp", desc: "Notificaciones automáticas", icon: MessageSquare, color: "text-green-600", active: false },
                { name: "Google Calendar", desc: "Sincronización de salas", icon: CalendarIcon, color: "text-blue-600", active: false },
                { name: "Resend", desc: "E-mails transaccionales", icon: Mail, color: "text-[var(--color-foreground)]", active: false },
                { name: "Instagram", desc: "Publicación de eventos", icon: Smartphone, color: "text-pink-600", active: false },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl hover:border-primary/30 transition-colors bg-[var(--color-background-soft)]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-[var(--color-background)] rounded-lg shadow-sm flex items-center justify-center border border-[var(--color-beige)] ${service.color}`}>
                      <service.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">{service.name}</h4>
                      <p className="text-xs text-[var(--color-foreground)] opacity-80">{service.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    {service.active ? "Configurar" : "Conectar"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Seguridad y Acceso</h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Protección de Datos</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background-soft)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">Autenticación en Dos Pasos (2FA)</h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-80">Añade una capa extra de seguridad</p>
                    </div>
                  </div>
                  <button className="w-12 h-6 bg-[var(--color-background-soft)] rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></button>
                </div>
                <div className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background-soft)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">Cifrado de Extremo a Extremo</h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-80">Datos de clientes 100% protegidos</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full uppercase">Activo</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Features Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Características de Élite</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Analítica Pro", desc: "Informes detallados de rentabilidad y ocupación.", icon: Rocket },
              { title: "Gestión de Equipos", desc: "Control de horarios y roles para tus empleados.", icon: Users },
              { title: "Smart Booking", desc: "Algoritmos que optimizan tus salas automáticamente.", icon: Zap },
            ].map((f) => (
              <Card key={f.title} className="hover:border-primary/20 bg-[var(--color-background)]">
                <div className="p-2 w-10 h-10 bg-primary/10 text-primary rounded-lg mb-4 flex items-center justify-center">
                  <f.icon size={20} />
                </div>
                <h4 className="font-bold text-[var(--color-foreground)] mb-1">{f.title}</h4>
                <p className="text-sm text-[var(--color-foreground)] opacity-80 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Plan & Pricing Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Plan y Suscripción</h2>
          </div>
          <Card className="w-full max-w-none border-2 border-primary bg-primary/5">
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                  Plan Profesional
                </div>
                <h3 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">EscapeMaster Full Access</h3>
                <p className="text-[var(--color-foreground)] opacity-90 max-w-md">
                  Todas las herramientas que necesitas para llevar tu escape room al siguiente nivel. Gestión, analítica y marketing en un solo lugar.
                </p>
              </div>
              <div className="bg-[var(--color-background)] p-8 rounded-2xl shadow-xl border border-[var(--color-beige)] text-center min-w-[280px]">
                <div className="text-sm text-[var(--color-foreground)] opacity-80 mb-1">Pago mensual</div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold text-[var(--color-foreground)]">24,79€</span>
                  <span className="text-lg font-medium text-[var(--color-foreground)] opacity-80">/mes</span>
                </div>
                <p className="text-xs text-[var(--color-foreground)] opacity-60 mt-1 italic">(Sin IVA incluido)</p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                    <CheckCircle2 className="text-green-500" size={16} />
                    <span>1 Mes de prueba gratis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                    <CheckCircle2 className="text-green-500" size={16} />
                    <span>Cancelación instantánea</span>
                  </div>
                </div>
                <Button className="w-full mt-8 group">
                  Empezar Prueba Gratis
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Support Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Ayuda y Soporte</h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)] italic">
            <div className="p-6 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <LifeBuoy size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--color-foreground)]">¿Necesitas asistencia?</h4>
                  <p className="text-[var(--color-foreground)] opacity-60">Nuestro equipo de expertos está disponible 24/7 para ayudarte con cualquier duda.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline">Documentación</Button>
                <Button>Hablar con Soporte</Button>
              </div>
            </div>
          </Card>
        </section>

        <div className="flex justify-end pt-6 pb-10">
          <Button
            size="lg"
            className="px-8 text-lg shadow-lg shadow-primary/20"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
