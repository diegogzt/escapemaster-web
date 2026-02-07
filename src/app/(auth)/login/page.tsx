"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/services/api";
import { Mail, Key, Lock, CheckCircle } from "lucide-react";

// Disable static prerendering due to useSearchParams
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "onboard">("login");
  
  // Onboarding multi-step state
  const [onboardStep, setOnboardStep] = useState<1 | 2 | 3>(1);
  const [onboardData, setOnboardData] = useState({
    email: "",
    verification_code: "", // Email verification
    invitation_code: "",   // Organization invitation
    password: "",
  });
  const [emailVerified, setEmailVerified] = useState(false);

  // Check for invitation code in URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setActiveTab("onboard");
      setOnboardData(prev => ({ ...prev, invitation_code: codeFromUrl.toUpperCase() }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const data = await auth.login(email, password);
      login(data.access_token);
    } catch (err: any) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send verification code to email
  const handleSendVerificationCode = async () => {
    if (!onboardData.email) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await auth.sendVerificationCode(onboardData.email);
      setSuccess("Código enviado a tu correo. Revisa tu bandeja de entrada.");
      setOnboardStep(2);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : "Error al enviar código");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the email code
  const handleVerifyEmailCode = async () => {
    if (!onboardData.verification_code) {
      setError("Ingresa el código de verificación");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await auth.verifyEmailCode(onboardData.email, onboardData.verification_code);
      setEmailVerified(true);
      setSuccess("¡Email verificado! Ahora crea tu contraseña.");
      setOnboardStep(3);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete onboarding with invitation code and password
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailVerified) {
      setError("Debes verificar tu email primero");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await auth.onboard({
        email: onboardData.email,
        invitation_code: onboardData.invitation_code,
        password: onboardData.password,
      });
      setActiveTab("login");
      setOnboardStep(1);
      setEmailVerified(false);
      setOnboardData({ email: "", verification_code: "", invitation_code: "", password: "" });
      alert("¡Registro completado! Ahora puedes iniciar sesión con tu nueva contraseña.");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail.map((e: any) => e.msg || e).join(', '));
      } else {
        setError("Error al completar el registro. Verifica tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset onboarding state when switching tabs
  const handleTabChange = (tab: "login" | "onboard") => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    if (tab === "onboard") {
      setOnboardStep(1);
      setEmailVerified(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden transition-colors duration-500">
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="w-full max-w-none shadow-2xl border-white/20 backdrop-blur-md bg-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                activeTab === "login" ? "text-white bg-white/10" : "text-white/50 hover:text-white/80"
              }`}
            >
              Acceso Estándar
            </button>
            <button
              onClick={() => handleTabChange("onboard")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                activeTab === "onboard" ? "text-white bg-white/10" : "text-white/50 hover:text-white/80"
              }`}
            >
              Acceso con Código
            </button>
          </div>

          <CardHeader className="text-center pb-2 border-white/10">
            <CardTitle level="h2" className="text-2xl font-bold text-white mt-4">
              {activeTab === "login" ? "Bienvenido" : "Activa tu Cuenta"}
            </CardTitle>
            <p className="text-white/80 mt-2">
              {activeTab === "login" 
                ? "Inicia sesión para continuar" 
                : onboardStep === 1 ? "Paso 1: Verifica tu email"
                : onboardStep === 2 ? "Paso 2: Ingresa el código"
                : "Paso 3: Crea tu contraseña"}
            </p>
          </CardHeader>

          {activeTab === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="space-y-5 p-6 pt-2">
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 transition-all"
                />
                <div className="space-y-1">
                  <Input
                    name="password"
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    required
                    labelClassName="text-white"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/50 transition-all"
                  />
                  <div className="flex justify-end">
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>
              </div>
              {error && <div className="px-6 pb-2 text-red-300 text-xs font-semibold animate-shake">{error}</div>}
              <CardFooter className="flex flex-col gap-4 pt-2 pb-8 border-white/10">
                <Button type="submit" block loading={loading} className="bg-white text-primary font-bold">
                  Iniciar Sesión
                </Button>
                <Link href="/register" className="text-center text-sm text-white/70 hover:underline">
                  ¿Eres dueño de un local? Regístrate aquí
                </Link>
              </CardFooter>
            </form>
          ) : (
            <div className="p-6 pt-2">
              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      onboardStep >= step 
                        ? "bg-white text-primary" 
                        : "bg-white/20 text-white/50"
                    }`}>
                      {onboardStep > step ? <CheckCircle size={18} /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-0.5 ${onboardStep > step ? "bg-white" : "bg-white/20"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Email input */}
              {onboardStep === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={onboardData.email}
                    onChange={(e) => setOnboardData({...onboardData, email: e.target.value})}
                    labelClassName="text-white"
                    className="bg-white/10 border-white/20 text-white"
                    icon={<Mail size={18} />}
                  />
                  <p className="text-xs text-white/60">
                    Te enviaremos un código de verificación a este correo.
                  </p>
                </div>
              )}

              {/* Step 2: Email verification code */}
              {onboardStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-white/10 p-3 rounded-lg text-center">
                    <p className="text-white/80 text-sm">Código enviado a:</p>
                    <p className="text-white font-bold">{onboardData.email}</p>
                  </div>
                  <Input
                    label="Código de Verificación (6 dígitos)"
                    placeholder="123456"
                    required
                    maxLength={6}
                    value={onboardData.verification_code}
                    onChange={(e) => setOnboardData({...onboardData, verification_code: e.target.value})}
                    labelClassName="text-white"
                    className="bg-white/10 border-white/20 text-white text-center text-xl tracking-widest"
                    icon={<Key size={18} />}
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="text-xs text-white/60 hover:text-white underline"
                  >
                    ¿No recibiste el código? Reenviar
                  </button>
                </div>
              )}

              {/* Step 3: Invitation code + Password */}
              {onboardStep === 3 && (
                <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                  <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/20 p-2 rounded-lg">
                    <CheckCircle size={16} />
                    Email verificado: {onboardData.email}
                  </div>
                  <Input
                    label="Código de Invitación (6 dígitos)"
                    placeholder="ABC123"
                    required
                    maxLength={6}
                    value={onboardData.invitation_code}
                    onChange={(e) => setOnboardData({...onboardData, invitation_code: e.target.value.toUpperCase()})}
                    labelClassName="text-white"
                    className="bg-white/10 border-white/20 text-white"
                    icon={<Key size={18} />}
                  />
                  <Input
                    label="Crea tu Contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    required
                    value={onboardData.password}
                    onChange={(e) => setOnboardData({...onboardData, password: e.target.value})}
                    labelClassName="text-white"
                    className="bg-white/10 border-white/20 text-white"
                    icon={<Lock size={18} />}
                  />
                  <p className="text-xs text-white/50 italic">
                    * El código de invitación te lo proporciona el administrador de tu organización.
                  </p>
                </form>
              )}

              {error && <div className="mt-4 text-red-300 text-xs font-semibold">{error}</div>}
              {success && <div className="mt-4 text-green-300 text-xs font-semibold">{success}</div>}

              <CardFooter className="flex flex-col gap-4 pt-4 pb-2 px-0">
                {onboardStep === 1 && (
                  <Button 
                    type="button" 
                    block 
                    loading={loading} 
                    onClick={handleSendVerificationCode}
                    className="bg-white text-primary font-bold"
                  >
                    Enviar Código de Verificación
                  </Button>
                )}
                {onboardStep === 2 && (
                  <Button 
                    type="button" 
                    block 
                    loading={loading}
                    onClick={handleVerifyEmailCode}
                    className="bg-white text-primary font-bold"
                  >
                    Verificar Código
                  </Button>
                )}
                {onboardStep === 3 && (
                  <Button 
                    type="submit" 
                    block 
                    loading={loading}
                    onClick={handleCompleteOnboarding}
                    className="bg-white text-primary font-bold"
                  >
                    Completar Registro
                  </Button>
                )}
                {onboardStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setOnboardStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    ← Volver al paso anterior
                  </button>
                )}
              </CardFooter>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-white/40 mt-8">
          &copy; {new Date().getFullYear()} EscapeMaster. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
