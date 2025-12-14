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
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Check if user has completed onboarding (has organization)
      const user = await auth.me();
      if (user.organization_id) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[60%] w-72 h-72 rounded-full bg-white/5 blur-3xl animate-pulse delay-500" />

        {/* Floating bubbles */}
        <div className="absolute top-[20%] left-[20%] w-32 h-32 rounded-full bg-white/5 blur-xl animate-bounce [animation-duration:3s]" />
        <div className="absolute bottom-[30%] right-[20%] w-24 h-24 rounded-full bg-white/5 blur-xl animate-bounce delay-700 [animation-duration:4s]" />
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Card className="w-full max-w-none shadow-2xl border-white/20 backdrop-blur-md bg-white/10">
          <CardHeader className="text-center pb-2 border-white/10">
            <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white backdrop-blur-sm shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>
            <CardTitle level="h2" className="text-2xl font-bold text-white">
              Bienvenido a EscapeMaster
            </CardTitle>
            <p className="text-white/80 mt-2">Inicia sesión para continuar</p>
          </CardHeader>
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
                    className="text-xs font-medium text-white/80 hover:text-white transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
            </div>
            {error && (
              <div className="px-6 pb-2">
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-white text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            <CardFooter className="flex flex-col gap-4 pt-2 pb-8 border-white/10">
              <Button
                type="submit"
                block
                loading={loading}
                className="h-11 text-base bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10 hover:shadow-black/20 transition-all hover:-translate-y-0.5 font-bold"
              >
                Iniciar Sesión
              </Button>
              <p className="text-center text-sm text-white/70">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/register"
                  className="text-white font-semibold hover:underline decoration-2 underline-offset-2"
                >
                  Regístrate
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-white/40 mt-8">
          &copy; {new Date().getFullYear()} EscapeMaster. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
