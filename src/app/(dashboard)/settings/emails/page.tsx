"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import RichTextEditor from "@/components/RichTextEditor";
import Button from "@/components/Button";
import { Mail, Save, Plus, Trash2, Globe, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { emailTemplates } from "@/services/api";

interface Template {
  id: string;
  type: string;
  language: string;
  subject: string;
  body: string;
  is_active: boolean;
}

export default function EmailSettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("es");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await emailTemplates.list();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSave = async (template: Template) => {
    try {
      setSaving(true);
      await emailTemplates.update(template.id, {
        subject: template.subject,
        body: template.body,
        is_active: template.is_active
      });
      alert("Plantilla guardada correctamente");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error al guardar la plantilla");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplate = async (lang: string) => {
    try {
      setSaving(true);
      const newTemplate = await emailTemplates.create({
        type: "session_completed",
        language: lang,
        subject: lang === "es" ? "¡Gracias por jugar! - {{room_name}}" : "Thanks for playing! - {{room_name}}",
        body: lang === "es" 
          ? "Hola {{player_name}},\n\nEsperamos que hayas disfrutado de tu sesión en {{room_name}} el día {{date}}.\n\n¡Te esperamos pronto!"
          : "Hi {{player_name}},\n\nWe hope you enjoyed your session in {{room_name}} on {{date}}.\n\nSee you soon!",
        is_active: true
      });
      setTemplates(prev => [...prev, newTemplate]);
      setActiveTab(lang);
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Error al crear la plantilla");
    } finally {
      setSaving(false);
    }
  };

  const currentTemplate = templates.find(t => t.language === activeTab && t.type === "session_completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Configuración de Email</h1>
        <p className="text-lg text-[var(--color-foreground)] opacity-60">
          Personaliza los correos automáticos que reciben tus clientes.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Plantilla: Sesión Finalizada</h2>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("es")}
              className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                activeTab === "es" 
                  ? "bg-primary text-white border-primary" 
                  : "bg-[var(--color-background-soft)] border-[var(--color-beige)] text-[var(--color-foreground)] hover:border-primary/30"
              }`}
            >
              <span className="text-lg">🇪🇸</span> Español
            </button>
            <button
              onClick={() => setActiveTab("en")}
              className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                activeTab === "en" 
                  ? "bg-primary text-white border-primary" 
                  : "bg-[var(--color-background-soft)] border-[var(--color-beige)] text-[var(--color-foreground)] hover:border-primary/30"
              }`}
            >
              <span className="text-lg">🇬🇧</span> Inglés
            </button>
          </div>

          {currentTemplate ? (
            <Card className="w-full max-w-4xl bg-[var(--color-background)] border-[var(--color-beige)]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Editar Plantilla ({activeTab.toUpperCase()})</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Estado</span>
                    <button
                      onClick={() => handleUpdateTemplate(currentTemplate.id, { is_active: !currentTemplate.is_active })}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${
                        currentTemplate.is_active 
                          ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {currentTemplate.is_active ? "Activa" : "Inactiva"}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <div className="p-6 pt-0 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-widest mb-2">Asunto del Email</label>
                  <Input 
                    value={currentTemplate.subject}
                    onChange={(e) => handleUpdateTemplate(currentTemplate.id, { subject: e.target.value })}
                    placeholder="Ej: ¡Gracias por jugar con nosotros!"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-foreground)] opacity-60 uppercase tracking-widest mb-2">Cuerpo del Mensaje</label>
                  <RichTextEditor
                    value={currentTemplate.body}
                    onChange={(value) => handleUpdateTemplate(currentTemplate.id, { body: value })}
                    placeholder="Escribe aquí el contenido del correo..."
                  />
                </div>

                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <h4 className="font-bold flex items-center gap-2 mb-3 text-primary text-sm">
                    <Sparkles size={16} />
                    Placeholders Disponibles
                  </h4>
                  <p className="text-xs text-[var(--color-foreground)] opacity-60 mb-4">Puedes usar estas etiquetas para personalizar el correo con los datos del cliente y la sesión:</p>
                  <div className="flex flex-wrap gap-2">
                    {["{{player_name}}", "{{room_name}}", "{{date}}", "{{time}}"].map(tag => (
                      <code key={tag} className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-[var(--color-beige)] text-primary text-xs font-bold">
                        {tag}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => handleSave(currentTemplate)} 
                    disabled={saving}
                    className="px-8"
                  >
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center py-20 bg-[var(--color-background-soft)] rounded-3xl border border-dashed border-[var(--color-beige)] max-w-4xl">
              <Mail className="mx-auto text-[var(--color-foreground)] opacity-20 mb-4" size={48} />
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">No hay plantilla en este idioma</h3>
              <p className="text-[var(--color-foreground)] opacity-60 mb-8 max-w-sm mx-auto">
                Crea una plantilla para enviar correos automáticos cuando finalice la sesión en {activeTab === "es" ? "español" : "inglés"}.
              </p>
              <Button onClick={() => handleCreateTemplate(activeTab)}>
                <Plus size={18} className="mr-2" /> Crear Plantilla {activeTab === "es" ? "Español" : "Inglés"}
              </Button>
            </div>
          )}
        </section>

        {/* Preview Section */}
        {currentTemplate && (
          <section>
             <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-primary" size={24} />
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">Vista Previa</h2>
            </div>
            <Card className="w-full max-w-4xl bg-white dark:bg-slate-900 border-[var(--color-beige)] p-0 overflow-hidden">
              <div className="bg-gray-100 dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-700 rounded-lg px-4 py-1.5 text-xs text-gray-500 flex items-center justify-between border border-gray-200 dark:border-slate-600">
                  <span>{currentTemplate.subject.replace('{{room_name}}', 'La Guarida del Hacker')}</span>
                </div>
              </div>
              <div className="p-10 text-[var(--color-foreground)]">
                <div 
                  className="prose dark:prose-invert max-w-none whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: currentTemplate.body
                      .replace('{{player_name}}', '<strong>Juan García</strong>')
                      .replace('{{room_name}}', '<strong>La Guarida del Hacker</strong>')
                      .replace('{{date}}', '<strong>14/01/2026</strong>')
                      .replace('{{time}}', '<strong>20:30</strong>')
                      .replace(/\n/g, '<br/>')
                  }} 
                />
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
