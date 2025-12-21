"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useInView,
  AnimatePresence
} from "framer-motion";
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Clock,
  Smartphone
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
            E
          </div>
          <span className={cn("font-bold text-xl tracking-tight", isScrolled ? "text-dark" : "text-dark")}>
            EscapeMaster
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Características", "Precios", "Testimonios", "FAQ"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary">
            Iniciar Sesión
          </Link>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              Empezar Gratis
            </motion.button>
          </Link>
        </div>

        <button 
          className="md:hidden text-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {["Características", "Precios", "Testimonios", "FAQ"].map((item) => (
                <Link 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="text-lg font-medium text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <hr className="border-gray-100 my-2" />
              <Link href="/login" className="text-lg font-medium text-gray-800">
                Iniciar Sesión
              </Link>
              <Link href="/register">
                <button className="w-full bg-primary text-white py-3 rounded-xl font-medium">
                  Empezar Gratis
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <section ref={containerRef} className="h-[120vh] relative flex flex-col items-center justify-start pt-32 overflow-hidden bg-[#FAFAFA]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.1),transparent_50%)]" />
      
      <motion.div 
        style={{ scale, opacity, y }}
        className="sticky top-32 text-center z-10 px-4 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            🚀 La plataforma #1 para Escape Rooms
          </span>
        </motion.div>
        
        <motion.h1 
          className="text-6xl md:text-8xl font-black text-dark tracking-tight leading-[1.1] mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
        >
          Gestiona tu <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            Escape Room
          </span> <br />
          como un Pro.
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Automatiza reservas, controla tus salas y fideliza clientes con la herramienta todo-en-uno diseñada para dueños exigentes.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link href="/register">
            <Button className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1">
              Comenzar Prueba Gratis <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="#demo">
            <button className="h-14 px-8 text-lg font-medium text-gray-600 hover:text-dark transition-colors flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-dark border-b-[6px] border-b-transparent ml-1" />
              </div>
              Ver Demo
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Abstract Background Elements */}
      <motion.div 
        className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ 
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </section>
  );
};

const FeatureCard = ({ icon, title, desc, index }: { icon: React.ReactNode, title: string, desc: string, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all group"
    >
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
        <div className="text-gray-600 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-dark mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      title: "Gestión de Reservas",
      desc: "Calendario intuitivo drag-and-drop para manejar todas tus sesiones sin conflictos. Sincronización en tiempo real.",
      icon: <Calendar size={28} />,
    },
    {
      title: "Control de Salas",
      desc: "Configura múltiples salas, capacidades, tiempos de limpieza y horarios personalizados para cada experiencia.",
      icon: <Settings size={28} />,
    },
    {
      title: "CRM de Clientes",
      desc: "Base de datos de clientes con historial de juegos, preferencias y herramientas de fidelización.",
      icon: <Users size={28} />,
    },
    {
      title: "Analíticas Avanzadas",
      desc: "Reportes detallados de ocupación, ingresos y rendimiento por sala para tomar mejores decisiones.",
      icon: <BarChart3 size={28} />,
    },
    {
      title: "Pagos Automatizados",
      desc: "Integra pasarelas de pago y gestiona depósitos, reembolsos y facturación automáticamente.",
      icon: <DollarSignIcon size={28} />,
    },
    {
      title: "Mobile First",
      desc: "Gestiona tu negocio desde cualquier lugar con nuestra interfaz optimizada para móviles y tablets.",
      icon: <Smartphone size={28} />,
    },
  ];

  return (
    <section id="características" className="py-32 bg-white relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-dark mb-6"
          >
            Todo lo que necesitas para <br />
            <span className="text-primary">escalar tu negocio</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            Deja de usar hojas de cálculo y herramientas desconectadas. Centraliza tu operación en una sola plataforma.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Helper for DollarSign since it wasn't imported
const DollarSignIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const DarkModeSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const background = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    ["#ffffff", "#1a1a1a", "#ffffff"]
  );

  const textColor = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    ["#1a1a1a", "#ffffff", "#1a1a1a"]
  );

  return (
    <motion.section 
      ref={ref}
      style={{ backgroundColor: background, color: textColor }}
      className="py-40 relative overflow-hidden transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.h2 
              className="text-5xl md:text-6xl font-bold mb-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              Modo Oscuro <br />
              <span className="text-primary">Impresionante</span>
            </motion.h2>
            <motion.p 
              className="text-xl opacity-80 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Diseñado para reducir la fatiga visual durante esas largas jornadas de gestión. 
              La interfaz se adapta a tus preferencias y al ambiente de tu sala de control.
            </motion.p>
            <ul className="space-y-4">
              {["Interfaz de alto contraste", "Menor consumo de energía", "Perfecto para ambientes tenues"].map((item, i) => (
                <motion.li 
                  key={i}
                  className="flex items-center gap-3 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                >
                  <CheckCircle2 className="text-primary" /> {item}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-700"
            >
              {/* Placeholder for a dashboard screenshot */}
              <div className="bg-gray-900 aspect-video p-6 flex flex-col gap-4">
                <div className="flex gap-4 mb-4">
                  <div className="w-1/4 h-24 bg-gray-800 rounded-lg animate-pulse" />
                  <div className="w-1/4 h-24 bg-gray-800 rounded-lg animate-pulse delay-75" />
                  <div className="w-1/4 h-24 bg-gray-800 rounded-lg animate-pulse delay-150" />
                  <div className="w-1/4 h-24 bg-gray-800 rounded-lg animate-pulse delay-200" />
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg w-full animate-pulse" />
              </div>
            </motion.div>
            
            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] rounded-full -z-10" />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const PricingCard = ({ plan, billingCycle }: { plan: any, billingCycle: string }) => {
  return (
    <motion.div
      whileHover={{ y: -15 }}
      className={cn(
        "relative p-8 rounded-3xl border flex flex-col h-full transition-all duration-300",
        plan.popular 
          ? "bg-dark text-white border-dark shadow-2xl scale-105 z-10" 
          : "bg-white text-dark border-gray-200 hover:border-primary/30 hover:shadow-xl"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          Más Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
        <p className={cn("text-sm", plan.popular ? "text-gray-300" : "text-gray-500")}>
          {plan.desc}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className={cn("text-sm", plan.popular ? "text-gray-400" : "text-gray-500")}>
            {plan.period}
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {plan.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className={cn("w-5 h-5 shrink-0", plan.popular ? "text-primary" : "text-green-500")} />
            <span className={plan.popular ? "text-gray-300" : "text-gray-600"}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/register" className="w-full">
        <Button 
          variant={plan.popular ? "primary" : "outline"} 
          className={cn(
            "w-full py-6 rounded-xl font-bold text-base",
            plan.popular ? "bg-primary hover:bg-primary/90 border-none" : "border-2"
          )}
        >
          {plan.cta}
        </Button>
      </Link>
    </motion.div>
  );
};

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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

  return (
    <section id="precios" className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-dark mb-6">Planes simples y transparentes</h2>
          <p className="text-xl text-gray-600 mb-10">
            Sin comisiones ocultas. Cancela cuando quieras.
          </p>

          <div className="flex items-center justify-center gap-4 bg-white p-1.5 rounded-full w-fit mx-auto border border-gray-200 shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === "monthly" ? "bg-dark text-white shadow-md" : "text-gray-500 hover:text-dark"
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                billingCycle === "yearly" ? "bg-dark text-white shadow-md" : "text-gray-500 hover:text-dark"
              )}
            >
              Anual <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {pricing.map((plan, i) => (
            <PricingCard key={i} plan={plan} billingCycle={billingCycle} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="font-bold text-xl tracking-tight">EscapeMaster</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plataforma integral para la gestión moderna de Escape Rooms. Potencia tu negocio con tecnología de punta.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Producto</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Características</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Precios</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Integraciones</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Compañía</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Carreras</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Términos</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Seguridad</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 EscapeMaster. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {/* Social icons placeholders */}
            <div className="w-5 h-5 bg-gray-800 rounded-full hover:bg-primary transition-colors cursor-pointer" />
            <div className="w-5 h-5 bg-gray-800 rounded-full hover:bg-primary transition-colors cursor-pointer" />
            <div className="w-5 h-5 bg-gray-800 rounded-full hover:bg-primary transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};

import Button from "@/components/Button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DarkModeSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
