import React from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { Card, CardContent } from "@/components/Card";

export default function LandingPage() {
  return (
    <div className="theme-tropical min-h-screen bg-light text-dark font-sans">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">EscapeMaster</div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary text-white hover:bg-dark">
              Registrarse
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-heading-1 mb-6 text-dark">
            Gestiona tus Escape Rooms con <span className="text-primary">Estilo</span>
          </h1>
          <p className="text-body text-secondary mb-8 max-w-lg">
            La solución integral para administrar reservas, salas y clientes. 
            Simplifica tu operación y enfócate en crear experiencias inolvidables.
          </p>
          <div className="flex space-x-4">
            <Link href="/register">
              <Button className="bg-primary text-white px-8 py-3 text-lg hover:bg-dark">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-secondary text-secondary px-8 py-3 text-lg hover:bg-secondary hover:text-white">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <Card className="relative bg-white/80 backdrop-blur-sm border-2 border-white shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-beige rounded w-3/4"></div>
                  <div className="h-4 bg-beige rounded"></div>
                  <div className="h-4 bg-beige rounded w-5/6"></div>
                  <div className="h-32 bg-light rounded-lg border-2 border-dashed border-secondary/30 flex items-center justify-center text-secondary">
                    Panel de Control
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-heading-2 text-center mb-16 text-dark">Todo lo que necesitas</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Gestión de Reservas",
                desc: "Calendario intuitivo para manejar todas tus sesiones.",
                icon: "📅",
              },
              {
                title: "Administración de Salas",
                desc: "Configura múltiples salas con diferentes capacidades y horarios.",
                icon: "uD83DuDD11",
              },
              {
                title: "Reportes Detallados",
                desc: "Analiza el rendimiento de tu negocio con métricas clave.",
                icon: "uD83DuDCC8",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-light transition-colors duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-heading-3 mb-2 text-primary">{feature.title}</h3>
                <p className="text-body text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-body-small opacity-70">
            © {new Date().getFullYear()} EscapeMaster. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
