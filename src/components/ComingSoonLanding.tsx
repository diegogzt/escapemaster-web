"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Palette, 
  Globe, 
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Smartphone
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ComingSoonLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const customizationRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".hero-content > *", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 }
    );

    // Floating elements animation
    if (floatingRef.current) {
      const elements = floatingRef.current.children;
      Array.from(elements).forEach((el, i) => {
        gsap.to(el, {
          y: "random(-20, 20)",
          x: "random(-20, 20)",
          rotation: "random(-15, 15)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2,
        });
      });
    }

    // Scroll Animations for Sections
    const sections = [featuresRef, customizationRef, mobileRef, waitlistRef];
    sections.forEach((section) => {
      if (section.current) {
        gsap.fromTo(
          section.current.querySelectorAll(".animate-on-scroll"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            scrollTrigger: {
              trigger: section.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
  }, { scope: containerRef });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div ref={containerRef} className="bg-[#051c14] text-white selection:bg-emerald-500/30">
      {/* Background Elements - Tropical Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-12 h-12 border border-emerald-500/20 rounded-lg rotate-12" />
          <div className="absolute top-[60%] left-[10%] w-8 h-8 bg-amber-500/20 rounded-full blur-sm" />
          <div className="absolute top-[30%] right-[15%] w-16 h-16 border border-emerald-500/20 rounded-full" />
          <div className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-white/5 rounded-md -rotate-12" />
        </div>

        <div className="hero-content z-10 text-center max-w-4xl">
          <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium tracking-wider uppercase">
            Próximamente 2026 • Tema Tropical
          </div>
          
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-200/50">
            ESCAPEMASTER
          </h1>
          
          <p className="text-xl md:text-3xl text-emerald-100/60 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            La plataforma integral que redefine la gestión de salas de escape. 
            Potencia tu negocio con tecnología de vanguardia y un toque exótico.
          </p>

          <button 
            onClick={() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-4 bg-emerald-500 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Únete a la lista de espera <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-on-scroll">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Todo lo que necesitas</h2>
            <p className="text-emerald-100/60 text-xl max-w-2xl mx-auto">
              Una suite completa de herramientas diseñadas específicamente para operadores de escape rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Calendar className="text-emerald-400" />, title: "Reservas Inteligentes", desc: "Sistema de calendario optimizado para máxima ocupación." },
              { icon: <Users className="text-emerald-400" />, title: "Gestión de Equipos", desc: "Control total sobre tus Game Masters y horarios." },
              { icon: <CreditCard className="text-emerald-400" />, title: "Pagos Seguros", desc: "Integración nativa con las principales pasarelas de pago." },
              { icon: <BarChart3 className="text-emerald-400" />, title: "Analíticas Avanzadas", desc: "Datos en tiempo real para tomar mejores decisiones." },
              { icon: <Palette className="text-emerald-400" />, title: "Personalización Total", desc: "Adapta la plataforma a la identidad de tu marca." },
              { icon: <Globe className="text-emerald-400" />, title: "Multi-idioma", desc: "Atiende a clientes de todo el mundo sin barreras." },
            ].map((feature, i) => (
              <div key={i} className="animate-on-scroll p-8 rounded-3xl bg-emerald-900/20 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-emerald-100/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Showcase */}
      <section ref={customizationRef} className="relative py-32 px-6 z-10 bg-emerald-950/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Tu marca, tus reglas</h2>
            <p className="text-emerald-100/60 text-xl mb-12 leading-relaxed">
              No somos solo un software, somos tu socio tecnológico. Personaliza cada aspecto de la experiencia del cliente, desde el widget de reserva hasta los correos de confirmación.
            </p>
            <ul className="space-y-4">
              {["Editor visual intuitivo", "Temas personalizados", "Dominio propio", "Integración con redes sociales"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg text-emerald-100/80">
                  <CheckCircle2 className="text-emerald-400" size={24} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-on-scroll relative aspect-square rounded-3xl overflow-hidden border border-emerald-500/20 bg-emerald-900/40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
            <Palette size={120} className="text-emerald-500/20" />
            <div className="relative z-10 p-8 w-full">
              <div className="bg-[#051c14] rounded-2xl p-6 border border-emerald-500/30 shadow-2xl">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-emerald-500/20 rounded" />
                  <div className="h-4 w-1/2 bg-emerald-500/10 rounded" />
                  <div className="h-32 w-full bg-emerald-500/5 rounded-xl border border-emerald-500/10 mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section ref={mobileRef} className="relative py-32 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-on-scroll order-2 lg:order-1 relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex justify-center lg:justify-start gap-8">
              {/* Mockup representation */}
              <div className="w-64 h-[500px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-black p-6 pt-12">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg mb-6" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-32 w-full bg-emerald-500/20 rounded-2xl border border-emerald-500/30" />
                    <div className="h-32 w-full bg-white/5 rounded-2xl" />
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-64 h-[500px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden relative mt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-black p-6 pt-12">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg mb-6" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-48 w-full bg-amber-500/10 rounded-2xl border border-amber-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-on-scroll order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <Smartphone size={16} />
              Próximamente en iOS y Android
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Tu negocio en tu bolsillo</h2>
            <p className="text-emerald-100/60 text-xl mb-8 leading-relaxed">
              Gestiona tus salas desde cualquier lugar. Nuestra aplicación móvil nativa te permitirá controlar reservas, comunicarte con tu equipo y ver estadísticas en tiempo real.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 grayscale opacity-50">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-xs"></span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Disponible en</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </div>
              <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 grayscale opacity-50">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-xs">▶</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Disponible en</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section ref={waitlistRef} className="relative py-32 px-6 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-7xl font-bold mb-8">Sé el primero en entrar</h2>
            <p className="text-emerald-100/60 text-xl mb-12">
              Estamos construyendo algo grande. Únete a la lista de espera para obtener acceso anticipado y beneficios exclusivos en el lanzamiento.
            </p>

            {submitted ? (
              <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold mb-2">¡Ya estás en la lista!</h3>
                <p>Te avisaremos en cuanto estemos listos para despegar.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-8 py-4 rounded-full bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors text-lg"
                />
                <button 
                  type="submit"
                  className="px-10 py-4 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Apuntarme
                </button>
              </form>
            )}
            
            <p className="mt-8 text-emerald-100/40 text-sm">
              Al suscribirte, aceptas nuestra <Link href="/privacy" className="underline hover:text-emerald-400">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 z-10 border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter">ESCAPEMASTER</div>
          <div className="flex gap-8 text-emerald-100/40 text-sm">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
            <Link href="/cookies" className="hover:text-emerald-400 transition-colors">Cookies</Link>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contacto</a>
          </div>
          <div className="text-emerald-100/20 text-sm">
            © 2025 EscapeMaster. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonLanding;
