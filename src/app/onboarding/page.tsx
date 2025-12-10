"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import { Check, Building2, Palette, Settings, UserPlus } from "lucide-react";
import { orgs, auth } from "@/services/api";

type Step = "theme" | "organization" | "invite" | "config";

export default function OnboardingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState<Step>("theme");
  const [orgMode, setOrgMode] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    orgName: "",
    orgCode: "",
    inviteEmail: "",
    address: "",
    city: "",
    zipCode: "",
    timezone: "Europe/Madrid",
    contactEmail: "",
    website: "",
    phone: "",
    businessType: "Escape Room"
  });

  const handleThemeSelect = (selectedTheme: "twilight" | "tropical") => {
    setTheme(selectedTheme);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrgSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (orgMode === "create") {
        if (!formData.orgName.trim()) {
          throw new Error("El nombre de la organización es obligatorio");
        }
        const res = await orgs.create({ name: formData.orgName });
        setOrgId(res.id);
        
        // Fetch updated user data to get the organization_id
        // The API assigns the user to the org automatically
        await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for DB consistency
        const userData = await auth.me();
        
        // Verify user now has organization
        if (!userData.organization_id) {
          throw new Error("Failed to assign user to organization");
        }
      } else {
        if (!formData.orgCode.trim()) {
          throw new Error("El código de invitación es obligatorio");
        }
        const res = await orgs.join(formData.orgCode);
        setOrgId(res.id);
        
        // Fetch updated user data
        await new Promise((resolve) => setTimeout(resolve, 500));
        await auth.me();
      }
      setStep("invite");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    try {
      if (formData.inviteEmail && orgId) {
        await orgs.invite(orgId, formData.inviteEmail);
        setFormData(prev => ({ ...prev, inviteEmail: "" })); // Clear input
        alert("Invitación enviada");
      }
    } catch (err: any) {
      alert("Error al invitar");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === "theme") setStep("organization");
    else if (step === "organization") handleOrgSubmit();
    else if (step === "invite") setStep("config");
    else if (step === "config") router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-light flex flex-col items-center py-12 px-4">
      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-12">
        <StepIndicator
          active={step === "theme"}
          completed={step !== "theme"}
          icon={<Palette size={20} />}
          label="Tema"
        />
        <div className="w-12 h-0.5 bg-beige" />
        <StepIndicator
          active={step === "organization"}
          completed={step !== "theme" && step !== "organization"}
          icon={<Building2 size={20} />}
          label="Organización"
        />
        <div className="w-12 h-0.5 bg-beige" />
        <StepIndicator
          active={step === "invite"}
          completed={step === "config"}
          icon={<UserPlus size={20} />}
          label="Invitar"
        />
        <div className="w-12 h-0.5 bg-beige" />
        <StepIndicator
          active={step === "config"}
          completed={false}
          icon={<Settings size={20} />}
          label="Configuración"
        />
      </div>

      <div className="w-full max-w-4xl">
        {step === "theme" && (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Elige tu estilo
            </h1>
            <p className="text-dark mb-8">
              Personaliza la apariencia de tu espacio de trabajo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Twilight Option */}
              <div
                onClick={() => handleThemeSelect("twilight")}
                className={`cursor-pointer transition-all transform hover:scale-105 ${
                  theme === "twilight"
                    ? "ring-4 ring-primary ring-offset-4"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Card className="h-full bg-[#FAFBFC]">
                  <div className="h-32 bg-[#4338CA] rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      Twilight
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tonos índigo y oscuros para una experiencia elegante y
                    profesional.
                  </p>
                </Card>
              </div>

              {/* Tropical Option */}
              <div
                onClick={() => handleThemeSelect("tropical")}
                className={`cursor-pointer transition-all transform hover:scale-105 ${
                  theme === "tropical"
                    ? "ring-4 ring-primary ring-offset-4"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Card className="h-full bg-[#E8F5F3]">
                  <div className="h-32 bg-[#1F6357] rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      Tropical
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Colores vibrantes y naturales para un ambiente fresco y
                    dinámico.
                  </p>
                </Card>
              </div>
            </div>
            <Button size="lg" onClick={handleNext}>
              Continuar
            </Button>
          </div>
        )}

        {step === "organization" && (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Tu Organización
            </h1>
            <p className="text-dark mb-8">
              Crea un nuevo espacio o únete a uno existente.
            </p>

            {!orgMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card className="cursor-pointer hover:border-primary" onClick={() => setOrgMode("create")}>
                  <CardHeader>
                    <CardTitle>Crear Organización</CardTitle>
                  </CardHeader>
                  <p className="mb-4">
                    Soy el administrador y quiero configurar mi empresa.
                  </p>
                  <Button variant="outline" block>
                    Crear
                  </Button>
                </Card>
                <Card className="cursor-pointer hover:border-primary" onClick={() => setOrgMode("join")}>
                  <CardHeader>
                    <CardTitle>Unirme a Organización</CardTitle>
                  </CardHeader>
                  <p className="mb-4">
                    Tengo un código de invitación de mi equipo.
                  </p>
                  <Button variant="outline" block>
                    Unirme
                  </Button>
                </Card>
              </div>
            ) : (
              <Card className="max-w-md mx-auto text-left">
                <CardHeader>
                  <CardTitle>
                    {orgMode === "create"
                      ? "Nueva Organización"
                      : "Unirse al equipo"}
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  {orgMode === "create" ? (
                    <>
                      <Input 
                        name="orgName" 
                        label="Nombre de la Organización" 
                        placeholder="Ej. Escape Room Madrid" 
                        value={formData.orgName}
                        onChange={handleInputChange}
                      />
                      <Input 
                        name="phone" 
                        label="Teléfono" 
                        placeholder="+34 600 000 000" 
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      <Select 
                        name="businessType" 
                        label="Tipo de Negocio"
                        value={formData.businessType}
                        onChange={handleInputChange}
                      >
                        <option value="Escape Room">Escape Room</option>
                        <option value="Centro de Ocio">Centro de Ocio</option>
                        <option value="Otro">Otro</option>
                      </Select>
                    </>
                  ) : (
                    <Input 
                      name="orgCode" 
                      label="Código de Invitación" 
                      placeholder="ABCD-1234" 
                      value={formData.orgCode}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="mt-6 flex space-x-4">
                  <Button variant="ghost" onClick={() => setOrgMode(null)}>
                    Atrás
                  </Button>
                  <Button block onClick={handleNext} loading={loading}>
                    {orgMode === "create" ? "Crear y Continuar" : "Unirse"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {step === "invite" && (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Invitar al Equipo
            </h1>
            <p className="text-dark mb-8">
              Añade a tus compañeros para que puedan acceder.
            </p>
            <Card className="max-w-md mx-auto text-left">
              <CardHeader>
                <CardTitle>Enviar Invitación</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <Input 
                  name="inviteEmail" 
                  label="Email del Usuario" 
                  placeholder="colega@ejemplo.com" 
                  value={formData.inviteEmail}
                  onChange={handleInputChange}
                />
                <Button variant="outline" block onClick={handleInvite} loading={loading}>
                  Enviar Invitación
                </Button>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("config")}>
                  Continuar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === "config" && (
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Configuración Inicial
            </h1>
            <p className="text-dark mb-8">
              Ajusta los últimos detalles antes de empezar.
            </p>
            <Card className="max-w-2xl mx-auto text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  name="address" 
                  label="Dirección" 
                  placeholder="Calle Principal 123" 
                  value={formData.address}
                  onChange={handleInputChange}
                />
                <Input 
                  name="city" 
                  label="Ciudad" 
                  placeholder="Madrid" 
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <Input 
                  name="zipCode" 
                  label="Código Postal" 
                  placeholder="28001" 
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
                <Select 
                  name="timezone" 
                  label="Zona Horaria"
                  value={formData.timezone}
                  onChange={handleInputChange}
                >
                  <option value="Europe/Madrid">Europe/Madrid</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </Select>
                <Input 
                  name="contactEmail" 
                  label="Email de Contacto" 
                  type="email" 
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                />
                <Input 
                  name="website" 
                  label="Sitio Web" 
                  placeholder="https://" 
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={handleNext}>
                  Finalizar Setup
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  active,
  completed,
  icon,
  label,
}: {
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          active || completed
            ? "bg-primary text-white shadow-lg scale-110"
            : "bg-white text-gray-400 border-2 border-gray-200"
        }`}
      >
        {completed ? <Check size={20} /> : icon}
      </div>
      <span
        className={`mt-2 text-sm font-medium ${
          active ? "text-primary" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
