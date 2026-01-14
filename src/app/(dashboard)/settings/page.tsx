"use client";

import React, { useState, useRef } from "react";
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
  Plus,
  Image as ImageIcon,
  X,
  Settings2,
  Trash2,
} from "lucide-react";
import { useTheme, CustomTheme, PaletteColors } from "@/context/ThemeContext";

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-foreground)] opacity-50 px-1">{label}</label>
      <div className="flex items-center gap-2 bg-[var(--color-background-soft)] border border-[var(--color-beige)] rounded-xl p-2 transition-all hover:border-primary/30">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--color-beige)] shadow-sm">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
          />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-sm font-mono w-20 outline-hidden text-[var(--color-foreground)]"
        />
      </div>
    </div>
  );
}

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
    setIsDarkMode,
    customThemes,
    saveCustomTheme,
    deleteCustomTheme
  } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [newThemeName, setNewThemeName] = useState("");
  const [lightColors, setLightColors] = useState<PaletteColors>({
    primary: "#1F6357",
    secondary: "#4DB8A8",
    background: "#F0F9F8",
    foreground: "#0D3D34",
    light: "#F0FAF7",
    beige: "rgba(0,0,0,0.05)"
  });
  const [darkColors, setDarkColors] = useState<PaletteColors>({
    primary: "#4DB8A8",
    secondary: "#1F6357",
    background: "#051A17",
    foreground: "#4DB8A8",
    light: "rgba(77, 184, 168, 0.1)",
    beige: "rgba(255,255,255,0.05)"
  });

  const handleOpenModal = (t?: CustomTheme) => {
    if (t) {
      setEditingTheme(t);
      setNewThemeName(t.name);
      setLightColors(t.light);
      setDarkColors(t.dark);
    } else {
      setEditingTheme(null);
      setNewThemeName("Mi Paleta Custom");
      setLightColors({ 
        primary: "#1F6357", 
        secondary: "#4DB8A8", 
        background: "#FFFFFF", 
        foreground: "#1F6357", 
        light: "rgba(31, 99, 87, 0.1)", 
        beige: "rgba(0,0,0,0.05)" 
      });
      setDarkColors({ 
        primary: "#4DB8A8", 
        secondary: "#1F6357", 
        background: "#0F172A", 
        foreground: "#F8FAFC", 
        light: "rgba(77, 184, 168, 0.1)", 
        beige: "rgba(255,255,255,0.05)" 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const id = editingTheme?.id || `custom-${Date.now()}`;
    saveCustomTheme({
      id,
      name: newThemeName,
      light: lightColors,
      dark: darkColors
    });
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Simple dominant color logic (sampling a few points)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r=0, g=0, b=0;
        for(let i=0; i<imageData.length; i+=400) { // Sample every 100 pixels
          r += imageData[i];
          g += imageData[i+1];
          b += imageData[i+2];
        }
        const count = imageData.length / 400;
        const avgR = Math.round(r/count);
        const avgG = Math.round(g/count);
        const avgB = Math.round(b/count);
        
        const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
        
        // Update colors based on extracted hex
        setLightColors(prev => ({ ...prev, primary: hex }));
        setDarkColors(prev => ({ ...prev, primary: hex }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
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

                  {/* Custom Themes */}
                  {customThemes.map((t) => (
                    <div key={t.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`w-full flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          theme === t.id
                            ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                            : "border-[var(--color-beige)] hover:border-primary/30"
                        }`}
                      >
                        <div className="flex gap-1 mb-3 pointer-events-none">
                          <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.light.primary }} />
                          <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: t.light.secondary }} />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-foreground)] pointer-events-none">{t.name}</span>
                      </button>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(t); }}
                          className="p-1 bg-white dark:bg-slate-800 rounded-full shadow-md text-primary hover:scale-110"
                        >
                          <Settings2 size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCustomTheme(t.id); }}
                          className="p-1 bg-white dark:bg-slate-800 rounded-full shadow-md text-red-500 hover:scale-110"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Create Custom Theme Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[var(--color-beige)] hover:border-primary hover:bg-primary/5 transition-all text-[var(--color-foreground)] opacity-60 hover:opacity-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                      <Plus size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Crear Propia</span>
                  </button>
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

        {/* Custom Theme Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--color-background)] border border-[var(--color-beige)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-[var(--color-beige)] flex items-center justify-between bg-[var(--color-background-soft)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-foreground)]">Diseña tu propia identidad visual</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-foreground)] opacity-40 hover:opacity-100 p-2"><X /></button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-widest mb-3">Nombre de la paleta</label>
                      <input 
                        type="text" 
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        className="w-full bg-[var(--color-background-soft)] border border-[var(--color-beige)] rounded-2xl p-4 text-xl font-medium focus:ring-2 ring-primary/20 outline-hidden"
                        placeholder="Ej: Marca Corporativa"
                      />
                    </div>

                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                        <Zap size={18} />
                        Auto-Generar desde Imagen
                      </h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-60 mb-6">Sube tu logo o una imagen de referencia y extraeremos los colores principales automáticamente.</p>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full py-6 rounded-2xl border-dashed">
                        <ImageIcon size={20} className="mr-2" />
                        Seleccionar Imagen
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Light Mode Config */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun size={18} className="text-amber-500" />
                        <h4 className="font-bold uppercase tracking-widest text-xs opacity-60">Modo Claro</h4>
                      </div>
                      <ColorPicker label="Principal" value={lightColors.primary} onChange={(v) => setLightColors({...lightColors, primary: v, light: v + '1a'})} />
                      <ColorPicker label="Secundario" value={lightColors.secondary} onChange={(v) => setLightColors({...lightColors, secondary: v})} />
                      <ColorPicker label="Fondo" value={lightColors.background} onChange={(v) => setLightColors({...lightColors, background: v})} />
                      <ColorPicker label="Texto" value={lightColors.foreground} onChange={(v) => setLightColors({...lightColors, foreground: v})} />
                      <ColorPicker label="Detalles (Light)" value={lightColors.light || ""} onChange={(v) => setLightColors({...lightColors, light: v})} />
                      <ColorPicker label="Bordes (Beige)" value={lightColors.beige || ""} onChange={(v) => setLightColors({...lightColors, beige: v})} />
                    </div>

                    {/* Dark Mode Config */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Moon size={18} className="text-indigo-500" />
                        <h4 className="font-bold uppercase tracking-widest text-xs opacity-60">Modo Oscuro</h4>
                      </div>
                      <ColorPicker label="Principal" value={darkColors.primary} onChange={(v) => setDarkColors({...darkColors, primary: v, light: v + '1a'})} />
                      <ColorPicker label="Secundario" value={darkColors.secondary} onChange={(v) => setDarkColors({...darkColors, secondary: v})} />
                      <ColorPicker label="Fondo" value={darkColors.background} onChange={(v) => setDarkColors({...darkColors, background: v})} />
                      <ColorPicker label="Texto" value={darkColors.foreground} onChange={(v) => setDarkColors({...darkColors, foreground: v})} />
                      <ColorPicker label="Detalles (Light)" value={darkColors.light || ""} onChange={(v) => setDarkColors({...darkColors, light: v})} />
                      <ColorPicker label="Bordes (Beige)" value={darkColors.beige || ""} onChange={(v) => setDarkColors({...darkColors, beige: v})} />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-12 p-1 bg-[var(--color-background-soft)] rounded-[2.5rem] border border-[var(--color-beige)] overflow-hidden">
                  <div 
                    className="p-8 rounded-[2.2rem] transition-colors duration-500"
                    style={{ 
                      backgroundColor: isDarkMode ? darkColors.background : lightColors.background,
                      color: isDarkMode ? darkColors.foreground : lightColors.foreground,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: isDarkMode ? darkColors.primary : lightColors.primary }}>
                          <Rocket size={20} />
                        </div>
                        <h5 className="font-black tracking-tighter text-xl">Preview Escapemaster</h5>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: isDarkMode ? darkColors.primary + '20' : lightColors.primary + '10', color: isDarkMode ? darkColors.primary : lightColors.primary }}>
                          Activo
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 rounded-2xl flex flex-col justify-end p-4 border border-[inherit]" style={{ backgroundColor: isDarkMode ? darkColors.secondary + '10' : lightColors.secondary + '05' }}>
                        <div className="w-1/2 h-2 rounded-full opacity-20" style={{ backgroundColor: isDarkMode ? darkColors.foreground : lightColors.foreground }} />
                        <div className="w-full h-4 mt-2 rounded-lg opacity-40" style={{ backgroundColor: isDarkMode ? darkColors.foreground : lightColors.foreground }} />
                      </div>
                      <div className="h-24 rounded-2xl flex flex-col justify-end p-4 border border-[inherit]" style={{ backgroundColor: isDarkMode ? darkColors.secondary + '10' : lightColors.secondary + '05' }}>
                        <div className="w-1/3 h-2 rounded-full opacity-20" style={{ backgroundColor: isDarkMode ? darkColors.foreground : lightColors.foreground }} />
                        <div className="w-full h-4 mt-2 rounded-lg opacity-40" style={{ backgroundColor: isDarkMode ? darkColors.foreground : lightColors.foreground }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--color-beige)] bg-[var(--color-background-soft)] flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>
                  {editingTheme ? "Guardar Cambios" : "Crear Paleta"}
                </Button>
              </div>
            </div>
          </div>
        )}

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
              <div className="md:col-span-2">
                <Input 
                  label="ER Director URL (Configurador de Disponibilidad)" 
                  defaultValue="https://www.residentriddle.es/"
                  placeholder="https://su-dominio.es/"
                  helperText="Esta URL se utiliza para obtener las horas disponibles de tus juegos si utilizas ER Director."
                />
              </div>
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

        {/* Feature Highlights (replacing security in this view or just removing personal items) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Políticas de Seguridad</h2>
          </div>
          <Card className="w-full max-w-none bg-[var(--color-background)] border-[var(--color-beige)]">
            <CardHeader>
              <CardTitle>Cumplimiento y Protección</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background-soft)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">Cifrado de Datos de Clientes</h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-60">Protección activa de datos sensibles.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full uppercase">Activo</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-[var(--color-beige)] rounded-xl bg-[var(--color-background-soft)] opacity-40 grayscale cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-500/10 text-gray-500 rounded-xl">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-foreground)]">Forzar 2FA (Próximamente)</h4>
                      <p className="text-sm text-[var(--color-foreground)] opacity-60">Obligar a todos los miembros a usar 2FA.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-500/10 px-2 py-1 rounded-full uppercase">Enterprise</span>
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
