"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/services/api";
export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "onboard">("login");
  const [onboardData, setOnboardData] = useState({
    email: "",
    invitation_code: "",
    password: "",
  });

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
      
      // The context will handle redirection after login
    } catch (err: any) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await auth.onboard(onboardData);
      // Success - switch to login and notify
      setActiveTab("login");
      alert("¡Registro completado! Ahora puedes iniciar sesión con tu nueva contraseña.");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al completar el registro. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background decorative elements omitted for brevity - keeping standard structures */}
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="w-full max-w-none shadow-2xl border-white/20 backdrop-blur-md bg-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                activeTab === "login" ? "text-white bg-white/10" : "text-white/50 hover:text-white/80"
              }`}
            >
              Acceso Estándar
            </button>
            <button
              onClick={() => setActiveTab("onboard")}
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
                : "Configura tu acceso con el código de invitación"}
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
                </div>
              </div>
              {error && <div className="px-6 pb-2 text-red-300 text-xs">{error}</div>}
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
            <form onSubmit={handleOnboard}>
              <div className="space-y-4 p-6 pt-2">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="el que te dio tu admin"
                  required
                  value={onboardData.email}
                  onChange={(e) => setOnboardData({...onboardData, email: e.target.value})}
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white"
                />
                <Input
                  label="Código de Invitación (6 dígitos)"
                  placeholder="ABC123"
                  required
                  maxLength={6}
                  value={onboardData.invitation_code}
                  onChange={(e) => setOnboardData({...onboardData, invitation_code: e.target.value.toUpperCase()})}
                  labelClassName="text-white"
                  className="bg-white/10 border-white/20 text-white"
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
                />
              </div>
              {error && <div className="px-6 pb-2 text-red-300 text-xs">{error}</div>}
              <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
                <Button type="submit" block loading={loading} className="bg-white text-primary font-bold">
                  Completar Registro
                </Button>
                <p className="text-center text-xs text-white/50 italic px-4">
                  * Este código te lo debe proporcionar el administrador de tu organización.
                </p>
              </CardFooter>
            </form>
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
