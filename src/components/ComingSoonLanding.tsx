"use client";

import React, { useRef, useState } from "react";
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
  ArrowRight
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ComingSoonLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const customizationRef = useRef<HTMLDivElement>(null);
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
    const sections = [featuresRef, customizationRef, waitlistRef];
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
    <div ref={containerRef} className="bg-black text-white selection:bg-primary/30">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-12 h-12 border border-white/10 rounded-lg rotate-12" />
          <div className="absolute top-[60%] left-[10%] w-8 h-8 bg-primary/20 rounded-full blur-sm" />
          <div className="absolute top-[30%] right-[15%] w-16 h-16 border border-primary/20 rounded-full" />
          <div className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-white/5 rounded-md -rotate-12" />
        </div>

        <div className="hero-content z-10 text-center max-w-4xl">
          <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium tracking-wider uppercase">
            Próximamente 2026
          </div>
          
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            ESCAPEMASTER
          </h1>
          
          <p className="text-xl md:text-3xl text-zinc-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            La plataforma integral que redefine la gestión de salas de escape. 
            Potencia tu negocio con tecnología de vanguardia.
          </p>

          <button 
            onClick={() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
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
      <section ref={featuresRef} className="relative py-32 px-6 z-10 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Funciones Potentes</h2>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu centro de escape desde un solo lugar, sin complicaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Calendar className="text-primary" size={32} />,
                title: "Reservas Inteligentes",
                desc: "Calendario dinámico con sincronización en tiempo real y gestión de sesiones automatizada."
              },
              {
                icon: <CreditCard className="text-primary" size={32} />,
                title: "TPV Integrado",
                desc: "Procesa pagos de forma segura, gestiona ventas en local y emite facturas al instante."
              },
              {
                icon: <Users className="text-primary" size={32} />,
                title: "Recursos Humanos",
                desc: "Control de horarios, gestión de vacaciones y asignación de roles para tu equipo."
              },
              {
                icon: <BarChart3 className="text-primary" size={32} />,
                title: "Análisis de Datos",
                desc: "Estadísticas detalladas sobre ocupación, ingresos y rendimiento de tus salas."
              }
            ].map((feature, i) => (
              <div key={i} className="animate-on-scroll p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-primary/30 transition-colors group">
                <div className="mb-6 p-3 bg-primary/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section ref={customizationRef} className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Tu marca, tus reglas</h2>
            <p className="text-zinc-400 text-xl mb-10 leading-relaxed">
              EscapeMaster no es solo una herramienta, es una extensión de tu negocio. 
              Personaliza cada detalle para que se adapte perfectamente a tu identidad visual.
            </p>
            
            <ul className="space-y-6">
              {[
                { icon: <Palette size={24} />, text: "Múltiples temas visuales (Tropical, Twilight, Vista...)" },
                { icon: <Globe size={24} />, text: "Soporte multi-idioma para clientes internacionales" },
                { icon: <ChevronRight size={24} />, text: "Personalización de correos y notificaciones" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-zinc-300">
                  <div className="text-primary">{item.icon}</div>
                  <span className="text-lg">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="animate-on-scroll relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-2 gap-4 p-8 w-full">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className={`h-32 rounded-2xl bg-zinc-900/80 border border-white/5 animate-pulse delay-${n*200}`} />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="h-2 w-3/4 bg-white/20 rounded-full mb-2" />
                <div className="h-2 w-1/2 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section ref={waitlistRef} className="relative py-32 px-6 z-10 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-7xl font-bold mb-8">Sé el primero en entrar</h2>
            <p className="text-zinc-400 text-xl mb-12 max-w-2xl mx-auto">
              Estamos aceptando un número limitado de centros para nuestra fase beta exclusiva. 
              Apúntate para recibir acceso anticipado y beneficios especiales.
            </p>

            {submitted ? (
              <div className="p-12 rounded-3xl bg-zinc-900 border border-primary/30 inline-flex flex-col items-center gap-4">
                <CheckCircle2 size={64} className="text-primary animate-bounce" />
                <h3 className="text-2xl font-bold">¡Ya estás en la lista!</h3>
                <p className="text-zinc-500">Te avisaremos muy pronto con las novedades.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-full bg-zinc-900 border border-white/10 focus:border-primary outline-none transition-colors text-lg"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/80 transition-all active:scale-95 whitespace-nowrap"
                >
                  Apuntarme ahora
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center z-10 relative">
        <div className="mb-8 flex justify-center gap-8 text-zinc-500 text-sm uppercase tracking-widest">
          <span>Seguridad</span>
          <span>Privacidad</span>
          <span>Términos</span>
        </div>
        <p className="text-zinc-600 text-xs tracking-widest uppercase">
          © 2025 EscapeMaster. La revolución de las salas de escape.
        </p>
      </footer>
    </div>
  );
};

export default ComingSoonLanding;
