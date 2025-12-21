"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const features = [
    {
      title: "Gestión de Reservas",
      desc: "Calendario intuitivo drag-and-drop para manejar todas tus sesiones sin conflictos.",
      icon: <Calendar className="w-6 h-6 text-primary" />,
    },
    {
      title: "Control de Salas",
      desc: "Configura múltiples salas, capacidades, tiempos de limpieza y horarios personalizados.",
      icon: <Settings className="w-6 h-6 text-primary" />,
    },
    {
      title: "CRM de Clientes",
      desc: "Base de datos de clientes con historial de juegos y preferencias para marketing.",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      title: "Analíticas Avanzadas",
      desc: "Reportes detallados de ocupación, ingresos y rendimiento por sala.",
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
    },
  ];

  const pricing = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? "29€" : "290€",
      period: billingCycle === "monthly" ? "/mes" : "/año",
      desc: "Perfecto para empezar tu primer Escape Room.",
      features: [
        "1 Sala",
        "Hasta 100 reservas/mes",
        "Soporte por email",
        "Panel básico",
      ],
      cta: "Comenzar Gratis",
      popular: false,
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "79€" : "790€",
      period: billingCycle === "monthly" ? "/mes" : "/año",
      desc: "Para negocios en crecimiento con múltiples salas.",
      features: [
        "Hasta 3 Salas",
        "Reservas ilimitadas",
        "Soporte prioritario",
        "Analíticas avanzadas",
        "Gestión de empleados",
      ],
      cta: "Prueba Gratuita",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      desc: "Soluciones a medida para franquicias.",
      features: [
        "Salas ilimitadas",
        "API personalizada",
        "Gestor de cuenta dedicado",
        "SLA garantizado",
        "Marca blanca",
      ],
      cta: "Contactar Ventas",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "¿Necesito tarjeta de crédito para la prueba?",
      answer:
        "No, puedes registrarte y probar todas las funcionalidades del plan Pro durante 14 días sin compromiso.",
    },
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer:
        "Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu panel de configuración.",
    },
    {
      question: "¿Ofrecen descuentos por pago anual?",
      answer:
        "Sí, al elegir la facturación anual obtienes 2 meses gratis en cualquiera de nuestros planes.",
    },
    {
      question: "¿Cómo funciona el soporte técnico?",
      answer:
        "Nuestro equipo está disponible por chat y email. Los planes Pro y Enterprise tienen prioridad en la cola de soporte.",
    },
  ];

  return (
    <div className="min-h-screen bg-light font-sans text-dark selection:bg-primary selection:text-white">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="text-xl font-bold text-dark tracking-tight">
                EscapeMaster
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                Características
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                Precios
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <div className="flex items-center space-x-4 ml-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link href="/register">
                  <Button size="sm" className="shadow-lg shadow-primary/20">
                    Registrarse Gratis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-dark"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray/10 absolute w-full">
            <div className="px-6 py-4 space-y-4 flex flex-col">
              <a
                href="#features"
                className="text-secondary hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#pricing"
                className="text-secondary hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Precios
              </a>
              <a
                href="#faq"
                className="text-secondary hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </a>
              <hr className="border-gray/10" />
              <Link
                href="/login"
                className="text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                <Button block>Registrarse Gratis</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2 fill-primary" />
              La plataforma #1 para Escape Rooms
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-dark mb-6 tracking-tight leading-tight">
              Gestiona tu Escape Room <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                sin complicaciones
              </span>
            </h1>
            <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Automatiza reservas, gestiona salas y fideliza clientes desde una
              única plataforma. Diseñada por dueños de Escape Rooms, para dueños
              de Escape Rooms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="shadow-xl shadow-primary/20 text-lg px-8"
                >
                  Empezar Prueba Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Ver Demo
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-secondary/70">
              No requiere tarjeta de crédito · 14 días de prueba · Cancelación
              en cualquier momento
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-dark/5 rounded-2xl p-2 md:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray/10 aspect-[16/9] relative group">
                {/* Mock UI */}
                <div className="absolute inset-0 bg-light flex">
                  {/* Sidebar Mock */}
                  <div className="w-16 md:w-64 bg-white border-r border-gray/10 p-4 hidden md:flex flex-col gap-4">
                    <div className="h-8 w-32 bg-gray/10 rounded mb-4"></div>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-full bg-gray/5 rounded flex items-center px-3 gap-3"
                      >
                        <div className="w-5 h-5 bg-gray/20 rounded-full"></div>
                        <div className="h-3 w-24 bg-gray/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                  {/* Main Content Mock */}
                  <div className="flex-1 p-6 md:p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                      <div className="h-8 w-48 bg-gray/10 rounded"></div>
                      <div className="flex gap-3">
                        <div className="h-10 w-10 bg-gray/10 rounded-full"></div>
                        <div className="h-10 w-32 bg-primary/10 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-32 bg-white rounded-xl border border-gray/10 shadow-sm p-4"
                        >
                          <div className="h-8 w-8 bg-primary/10 rounded-full mb-3"></div>
                          <div className="h-4 w-24 bg-gray/10 rounded mb-2"></div>
                          <div className="h-8 w-16 bg-gray/20 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-64 bg-white rounded-xl border border-gray/10 shadow-sm p-4">
                      <div className="h-6 w-32 bg-gray/10 rounded mb-4"></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-12 w-full bg-gray/5 rounded"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-dark/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href="/register">
                    <Button size="lg" className="scale-110">
                      Explorar Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 bg-white border-y border-gray/10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-8">
            Confían en nosotros más de 500 Escape Rooms
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos placeholders */}
            {[
              "EscapeX",
              "MysteryDoor",
              "Lock&Key",
              "PuzzleMaster",
              "SecretRoom",
            ].map((brand) => (
              <div
                key={brand}
                className="text-xl font-bold text-dark flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-dark rounded-full"></div>
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-light relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Todo lo que necesitas para crecer
            </h2>
            <p className="text-lg text-secondary">
              Deja de usar hojas de cálculo y pásate a una gestión profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  {React.cloneElement(feature.icon as any, {
                    className:
                      "w-6 h-6 text-primary group-hover:text-white transition-colors",
                  })}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Highlight */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-dark text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Seguridad y Control
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6">
                Control total sobre tu negocio, estés donde estés
              </h2>
              <p className="text-lg text-secondary mb-8">
                Accede a tu panel desde cualquier dispositivo. Gestiona permisos
                de empleados, controla el acceso a la caja y monitorea las
                reservas en tiempo real.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Roles y permisos personalizables",
                  "Registro de actividad detallado",
                  "Copias de seguridad automáticas",
                  "Acceso seguro SSL/TLS",
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-dark">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline">Conocer más características</Button>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full"></div>
              <div className="relative bg-light rounded-2xl p-8 border border-gray/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray/10 pb-4">
                    <div className="font-bold text-dark">
                      Actividad Reciente
                    </div>
                    <div className="text-sm text-primary">Ver todo</div>
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 hover:bg-white rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        U{i}
                      </div>
                      <div>
                        <div className="font-medium text-dark">
                          Nueva reserva confirmada
                        </div>
                        <div className="text-xs text-secondary">
                          Hace {i * 5} minutos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-light">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Planes simples y transparentes
            </h2>
            <p className="text-lg text-secondary mb-8">
              Elige el plan que mejor se adapte a tu etapa actual.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span
                className={`text-sm font-medium ${
                  billingCycle === "monthly" ? "text-dark" : "text-secondary"
                }`}
              >
                Mensual
              </span>
              <button
                className="w-14 h-8 bg-primary rounded-full p-1 relative transition-colors"
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    billingCycle === "yearly" ? "translate-x-6" : ""
                  }`}
                ></div>
              </button>
              <span
                className={`text-sm font-medium ${
                  billingCycle === "yearly" ? "text-dark" : "text-secondary"
                }`}
              >
                Anual{" "}
                <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full ml-1">
                  -20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 border ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105 z-10"
                    : "border-gray/10 shadow-sm"
                } flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Más Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-dark">
                      {plan.price}
                    </span>
                    <span className="text-secondary ml-1">{plan.period}</span>
                  </div>
                  <p className="text-secondary text-sm">{plan.desc}</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-dark">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  block
                  className={plan.popular ? "shadow-lg shadow-primary/20" : ""}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-dark text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-light/30 hover:bg-light transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-dark">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="text-primary" />
                  ) : (
                    <ChevronDown className="text-secondary" />
                  )}
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index
                      ? "max-h-40 py-4 opacity-100"
                      : "max-h-0 py-0 opacity-0"
                  }`}
                >
                  <p className="text-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para llevar tu Escape Room al siguiente nivel?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Únete a cientos de propietarios que ya han optimizado su negocio con
            EscapeMaster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-white hover:text-primary text-lg px-10"
              >
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-dark text-lg px-10"
              >
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-dark border-t border-white/10 py-12 text-white/60 text-sm">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-xl mb-4">
                EscapeMaster
              </div>
              <p>La plataforma integral para la gestión de salas de escape.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-primary">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Integraciones
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Compañía</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-primary">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Términos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/10">
            © {new Date().getFullYear()} EscapeMaster. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
