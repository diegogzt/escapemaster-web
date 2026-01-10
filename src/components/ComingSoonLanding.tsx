"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Calendar, 
  Users, 
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
  const magneticBtnRef = useRef<HTMLButtonElement>(null);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useGSAP(() => {
    // Hero Animations - Text Reveal
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    tl.fromTo(".hero-badge", 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    )
    .fromTo(".hero-title", 
      { y: 100, opacity: 0, skewY: 7, filter: "blur(10px)" },
      { y: 0, opacity: 1, skewY: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.1 },
      "-=0.6"
    )
    .fromTo(".hero-description", 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.8"
    )
    .fromTo(".hero-cta", 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.6"
    );

    // Floating elements animation
    if (floatingRef.current) {
      const elements = floatingRef.current.children;
      Array.from(elements).forEach((el, i) => {
        gsap.to(el, {
          y: "random(-30, 30)",
          x: "random(-30, 30)",
          rotation: "random(-20, 20)",
          duration: "random(4, 6)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3,
        });
      });
    }

    // Mouse Parallax Effect
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 40;
      const yPos = (clientY / window.innerHeight - 0.5) * 40;

      gsap.to(".parallax-bg", {
        x: xPos,
        y: yPos,
        duration: 1,
        ease: "power2.out",
        stagger: 0.05
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Magnetic Button Effect
    const magneticBtn = magneticBtnRef.current;
    if (magneticBtn) {
      const handleMagneticMove = (e: MouseEvent) => {
        const rect = magneticBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(magneticBtn, {
          x: x * 0.4,
          y: y * 0.4,
          duration: 0.5,
          ease: "power2.out"
        });
        
        gsap.to(magneticBtn.querySelector(".btn-content"), {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.5,
          ease: "power2.out"
        });
      };

      const handleMagneticLeave = () => {
        gsap.to([magneticBtn, magneticBtn.querySelector(".btn-content")], {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.3)"
        });
      };

      magneticBtn.addEventListener("mousemove", handleMagneticMove);
      magneticBtn.addEventListener("mouseleave", handleMagneticLeave);
    }

    // Scroll Animations for Sections
    const sections = [featuresRef, customizationRef, mobileRef, waitlistRef];
    sections.forEach((section) => {
      if (section.current) {
        // Heading reveal animation
        gsap.fromTo(
          section.current.querySelectorAll("h2"),
          { y: 50, opacity: 0, skewY: 2 },
          {
            y: 0,
            opacity: 1,
            skewY: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section.current,
              start: "top 80%",
            },
          }
        );

        // Cards and other elements
        gsap.fromTo(
          section.current.querySelectorAll(".animate-on-scroll, .feature-card"),
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, { scope: containerRef });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div ref={containerRef} className="theme-tropical bg-background text-foreground selection:bg-secondary/30">
      {/* Background Elements - Tropical Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="parallax-bg absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="parallax-bg absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="parallax-bg absolute top-[20%] right-[15%] w-[20%] h-[20%] bg-primary/5 blur-[80px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-12 h-12 border border-secondary/10 rounded-lg rotate-12" />
          <div className="absolute top-[60%] left-[10%] w-8 h-8 bg-primary/5 rounded-full blur-sm" />
          <div className="absolute top-[30%] right-[15%] w-16 h-16 border border-secondary/10 rounded-full" />
          <div className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-primary/5 rounded-md -rotate-12" />
        </div>

        <div className="z-10 text-center max-w-4xl">
          <div className="hero-badge inline-block px-4 py-1.5 mb-8 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-sm font-medium tracking-wider uppercase">
            Próximamente 2026
          </div>
          
          <h1 className="hero-title text-4xl md:text-7xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-linear-to-b from-foreground to-primary">
            ESCAPEMASTER
          </h1>
          
          <p className="hero-description text-xl md:text-2xl text-foreground/60 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            La plataforma integral que redefine la gestión de salas de escape. 
            Potencia tu negocio con tecnología de vanguardia y un toque exótico.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              ref={magneticBtnRef}
              onClick={() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-8 py-4 bg-primary text-white font-bold rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(31,99,87,0.3)]"
            >
              <span className="btn-content relative z-10 flex items-center gap-2">
                Únete a la lista de espera
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button 
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-secondary hover:text-light font-medium flex items-center gap-2 transition-colors"
            >
              Explorar funciones
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-6 h-10 border-2 border-foreground rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-foreground rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="animate-on-scroll text-4xl md:text-7xl font-bold mb-6 tracking-tight">
                Todo lo que necesitas <br />
                <span className="text-primary">en un solo lugar.</span>
              </h2>
              <p className="animate-on-scroll text-lg text-foreground/60 max-w-xl font-light">
                Diseñado específicamente para dueños de salas de escape que buscan 
                excelencia operativa y una experiencia de usuario inigualable.
              </p>
            </div>
            <div className="animate-on-scroll hidden md:block">
              <div className="px-6 py-3 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-sm font-medium">
                Funciones Premium
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Reservas Inteligentes",
                desc: "Sistema de calendario fluido con gestión de disponibilidad en tiempo real y pagos integrados.",
                icon: <Calendar className="w-6 h-6" />,
                accentClass: "text-primary bg-primary/20",
                borderClass: "bg-primary"
              },
              {
                title: "Panel de Control",
                desc: "Visualiza tus métricas, ingresos y ocupación con analíticas detalladas y reportes automáticos.",
                icon: <BarChart3 className="w-6 h-6" />,
                accentClass: "text-secondary bg-secondary/20",
                borderClass: "bg-secondary"
              },
              {
                title: "Gestión de Clientes",
                desc: "Base de datos centralizada con historial de juegos, preferencias y sistema de fidelización.",
                icon: <Users className="w-6 h-6" />,
                accentClass: "text-accent bg-accent/20",
                borderClass: "bg-accent"
              },
              {
                title: "Automatización",
                desc: "Envío automático de recordatorios, correos de seguimiento y gestión de reseñas.",
                icon: <ArrowRight className="w-6 h-6" />,
                accentClass: "text-secondary bg-secondary/20",
                borderClass: "bg-secondary"
              },
              {
                title: "Multi-Sede",
                desc: "Gestiona múltiples ubicaciones desde una sola cuenta con permisos granulares.",
                icon: <Globe className="w-6 h-6" />,
                accentClass: "text-primary bg-primary/20",
                borderClass: "bg-primary"
              },
              {
                title: "Soporte 24/7",
                desc: "Asistencia técnica dedicada para asegurar que tu negocio nunca se detenga.",
                icon: <CheckCircle2 className="w-6 h-6" />,
                accentClass: "text-accent bg-accent/20",
                borderClass: "bg-accent"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="feature-card group relative p-10 rounded-[2.5rem] border border-foreground/5 bg-background hover:border-primary/20 transition-all duration-500 overflow-hidden shadow-xs hover:shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/5 to-transparent rounded-bl-[5rem] -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-110" />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${feature.accentClass}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/50 leading-relaxed text-lg font-light group-hover:text-foreground/80 transition-colors">
                    {feature.desc}
                  </p>
                </div>

                <div className={`absolute bottom-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.borderClass}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Showcase */}
      <section ref={customizationRef} className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-on-scroll">
            <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight text-foreground">Tu marca, <br />tus reglas</h2>
            <p className="text-foreground/60 text-xl mb-12 leading-relaxed font-light">
              No somos solo un software, somos tu socio tecnológico. Personaliza cada aspecto de la experiencia del cliente, desde el widget de reserva hasta los correos de confirmación.
            </p>
            <ul className="space-y-6">
              {[
                "Editor visual intuitivo", 
                "Temas personalizados", 
                "Dominio propio", 
                "Integración con redes sociales"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg text-foreground/80">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="text-primary" size={16} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-on-scroll relative aspect-square rounded-[3rem] overflow-hidden border border-foreground/5 bg-white flex items-center justify-center group shadow-xl">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <Palette size={120} className="text-primary/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 p-8 w-full">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-foreground/5 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-primary/50" />
                  <div className="w-3 h-3 rounded-full bg-accent/50" />
                  <div className="w-3 h-3 rounded-full bg-secondary/50" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-primary/20 rounded-full" />
                  <div className="h-4 w-1/2 bg-primary/10 rounded-full" />
                  <div className="h-40 w-full bg-primary/5 rounded-2xl border border-foreground/5 mt-6 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
                  </div>
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
            <div className="parallax-bg absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex justify-center lg:justify-start gap-8">
              {/* Mockup representation */}
              <div className="w-64 h-[500px] bg-background rounded-[3rem] border-8 border-primary shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-primary rounded-b-2xl z-20" />
                <div className="absolute inset-0 bg-linear-to-b from-primary/10 to-background p-6 pt-12">
                  <div className="w-10 h-10 bg-primary rounded-lg mb-6 animate-pulse" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-primary/10 rounded-full" />
                    <div className="h-4 w-2/3 bg-primary/10 rounded-full" />
                    <div className="h-32 w-full bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center">
                      <BarChart3 className="text-primary/40 w-12 h-12" />
                    </div>
                    <div className="h-32 w-full bg-primary/5 rounded-2xl" />
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-64 h-[500px] bg-background rounded-[3rem] border-8 border-primary shadow-2xl overflow-hidden relative mt-12 group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-primary rounded-b-2xl z-20" />
                <div className="absolute inset-0 bg-linear-to-b from-secondary/10 to-background p-6 pt-12">
                  <div className="w-10 h-10 bg-secondary rounded-lg mb-6" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-secondary/10 rounded-full" />
                    <div className="h-4 w-2/3 bg-secondary/10 rounded-full" />
                    <div className="h-48 w-full bg-secondary/10 rounded-2xl border border-secondary/10 flex items-center justify-center">
                      <Users className="text-secondary/40 w-16 h-16" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-on-scroll order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Smartphone size={16} />
              Próximamente en iOS y Android
            </div>
            <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight text-foreground">Tu negocio <br />en tu bolsillo</h2>
            <p className="text-foreground/60 text-xl mb-10 leading-relaxed font-light">
              Gestiona tus salas desde cualquier lugar. Nuestra aplicación móvil nativa te permitirá controlar reservas, comunicarte con tu equipo y ver estadísticas en tiempo real.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-8 py-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center gap-4 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-not-allowed">
                <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center text-foreground">
                  <span className="text-xl"></span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Disponible en</p>
                  <p className="text-lg font-bold text-foreground">App Store</p>
                </div>
              </div>
              <div className="px-8 py-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center gap-4 grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-not-allowed">
                <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center text-foreground">
                  <span className="text-xl">▶</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Disponible en</p>
                  <p className="text-lg font-bold text-foreground">Google Play</p>
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
            <h2 className="text-4xl md:text-7xl font-bold mb-8 text-foreground">Sé el primero en entrar</h2>
            <p className="text-foreground/60 text-xl mb-12 font-light">
              Estamos construyendo algo grande. Únete a la lista de espera para obtener acceso anticipado y beneficios exclusivos en el lanzamiento.
            </p>

            {submitted ? (
              <div className="p-10 rounded-[2.5rem] bg-primary/10 border border-primary/20 text-primary shadow-2xl">
                <CheckCircle2 className="mx-auto mb-6" size={64} />
                <h3 className="text-3xl font-bold mb-3">¡Ya estás en la lista!</h3>
                <p className="text-lg opacity-80">Te avisaremos en cuanto estemos listos para despegar.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 p-2 rounded-[3rem] bg-foreground/5 border border-foreground/10 backdrop-blur-sm">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-8 py-4 rounded-full bg-transparent focus:outline-none text-lg text-foreground"
                />
                <button 
                  type="submit"
                  className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg"
                >
                  Apuntarme
                </button>
              </form>
            )}
            
            <p className="mt-8 text-foreground/30 text-sm">
              Al suscribirte, aceptas nuestra <Link href="/privacy" className="underline hover:text-primary">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 z-10 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter text-foreground">ESCAPEMASTER</div>
          <div className="flex gap-8 text-foreground/40 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            <a href="#" className="hover:text-secondary transition-colors">Contacto</a>
          </div>
          <div className="text-light/20 text-sm">
            © 2025 EscapeMaster. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonLanding;
