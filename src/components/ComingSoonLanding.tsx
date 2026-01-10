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
  Smartphone,
  Zap,
  Star,
  MessageSquare,
  Shield,
  Clock,
  Layout,
  Trophy,
  Rocket,
  GripHorizontal,
  Settings2,
  Brush,
  Maximize2,
  Plus,
  History,
  Sun,
  Moon
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const THEMES = {
  tropical: {
    name: "Tropical",
    primary: "#1F6357",
    secondary: "#4DB8A8",
    accent: "#F4E9CD",
    background: "#F0F9F8",
    foreground: "#0D3D34",
    darkBackground: "#051A17",
    darkForeground: "#4DB8A8"
  },
  ocean: {
    name: "Ocean",
    primary: "#006D77",
    secondary: "#83C5BE",
    accent: "#E5F3FF",
    background: "#F0F8F9",
    foreground: "#003D42",
    darkBackground: "#001517",
    darkForeground: "#83C5BE"
  },
  sunset: {
    name: "Sunset",
    primary: "#FF6B9D",
    secondary: "#FFA07A",
    accent: "#FFF1E6",
    background: "#FFF8F0",
    foreground: "#4A1A0B",
    darkBackground: "#1A0A05",
    darkForeground: "#FFA07A"
  },
  nature: {
    name: "Nature",
    primary: "#2D6A4F",
    secondary: "#52B788",
    accent: "#F0FDF4",
    background: "#F0F9F1",
    foreground: "#112D21",
    darkBackground: "#05140E",
    darkForeground: "#52B788"
  },
  mint: {
    name: "Mint Fresh",
    primary: "#1F756E",
    secondary: "#5DDCC3",
    accent: "#C8E86C",
    background: "#F0FAF7",
    foreground: "#0D332F",
    darkBackground: "#031412",
    darkForeground: "#5DDCC3"
  },
  vista: {
    name: "Vista",
    primary: "#D56A34",
    secondary: "#3F170E",
    accent: "#F9F7E9",
    background: "#FDFCF5",
    foreground: "#2A0F08",
    darkBackground: "#2A0F08",
    darkForeground: "#FDFCF5"
  }
};

const ComingSoonLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const customizationRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const magneticBtnRef = useRef<HTMLButtonElement>(null);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>("tropical");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [widgets, setWidgets] = useState<any[]>([
    { id: "calendar", title: "Calendario", type: "preview", width: 420, height: 350, Icon: Calendar, color: "bg-primary/10 text-primary", content: "Disponibilidad en tiempo real" },
    { id: "stats", title: "Métricas", type: "chart", width: 320, height: 300, Icon: BarChart3, color: "bg-secondary/10 text-secondary", content: "mensual" },
    { id: "users", title: "Equipo", type: "list", width: 320, height: 280, Icon: Users, color: "bg-accent/10 text-accent", content: "Gestión de personal" },
    { id: "activity", title: "Actividad", type: "list", width: 320, height: 220, Icon: History, color: "bg-primary/10 text-primary", content: "Últimas 5 reservas" }
  ]);

  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  React.useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);

    // Listen for changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  React.useEffect(() => {
    const theme = THEMES[activeTheme] as any;
    const root = document.documentElement;
    
    const bg = isDarkMode ? theme.darkBackground : theme.background;
    const fg = isDarkMode ? theme.darkForeground : theme.foreground;
    
    // Set CSS variables with !important priority for Tailwind 4
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent || theme.secondary);
    root.style.setProperty('--color-background', bg);
    root.style.setProperty('--color-foreground', fg);
    
    // Update theme classes on root
    Object.keys(THEMES).forEach(t => {
      root.classList.remove(`theme-${t}`);
    });
    root.classList.add(`theme-${activeTheme}`);
    
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    // Force background and color transitions
    document.body.style.backgroundColor = bg;
  }, [activeTheme, isDarkMode]);

  useGSAP(() => {
    // Header Animation
    gsap.fromTo(".header-nav",
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out", delay: 0.5 }
    );

    const tl = gsap.timeline();
    
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

    // Resize Handler
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (resizingWidget) {
        setWidgets(prev => prev.map(w => {
          if (w.id === resizingWidget) {
            const dx = e.clientX - resizeStart.x;
            const dy = e.clientY - resizeStart.y;
            return {
              ...w,
              width: Math.max(250, resizeStart.w + dx),
              height: Math.max(150, resizeStart.h + dy)
            };
          }
          return w;
        }));
      }
    };

    const handleGlobalMouseUp = () => {
      setResizingWidget(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

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
    const sections = [featuresRef, templatesRef, customizationRef, mobileRef, testimonialsRef, pricingRef, waitlistRef];
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
    <div ref={containerRef} className="bg-background text-foreground selection:bg-secondary/30 transition-colors duration-500">
      {/* Header */}
      <header className="header-nav fixed top-0 left-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-background/70 backdrop-blur-xl border border-foreground/5 rounded-full px-6 py-3 shadow-sm transition-colors duration-500">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter text-foreground">
              ESCAPEMASTER
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Producto</button>
              <button onClick={() => templatesRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Personalizar</button>
              <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Precios</button>
              <Link href="/blog" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors">Blog</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full border border-foreground/5 bg-background/50 hover:bg-background transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <Link href="/login" className="hidden md:block text-sm font-medium text-foreground/60 hover:text-foreground transition-colors px-4 py-2">
              Iniciar sesión
            </Link>
            <button 
              onClick={() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-all shadow-sm"
            >
              Empezar gratis
            </button>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-0.5 bg-foreground mb-1"></div>
              <div className="w-6 h-0.5 bg-foreground mb-1"></div>
              <div className="w-6 h-0.5 bg-foreground"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col p-8 transition-colors duration-500">
          <div className="flex justify-between items-center mb-12">
            <div className="text-xl font-bold tracking-tighter text-foreground">ESCAPEMASTER</div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-foreground/40 hover:text-foreground">
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-8 text-2xl font-bold text-foreground">
            <button onClick={() => { featuresRef.current?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }} className="text-left py-4 border-b border-foreground/5">Producto</button>
            <button onClick={() => { templatesRef.current?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }} className="text-left py-4 border-b border-foreground/5">Personalizar</button>
            <button onClick={() => { pricingRef.current?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }} className="text-left py-4 border-b border-foreground/5">Precios</button>
            <Link href="/blog" className="py-4 border-b border-foreground/5">Blog</Link>
          </nav>
          <div className="mt-auto pt-8 flex flex-col gap-4">
             <Link href="/login" className="w-full py-4 text-center font-bold text-foreground/60">Iniciar sesión</Link>
             <button onClick={() => { waitlistRef.current?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }} className="w-full py-4 bg-primary text-white font-bold rounded-2xl">Empezar gratis</button>
          </div>
        </div>
      )}

      {/* Background Elements - Tropical Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 grid-pattern overflow-hidden" />
        <div className="parallax-bg absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="parallax-bg absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="parallax-bg absolute top-[20%] right-[15%] w-[20%] h-[20%] bg-primary/5 blur-[80px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col justify-start px-6 pt-40 overflow-hidden">
        <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-12 h-12 border border-secondary/10 rounded-lg rotate-12" />
          <div className="absolute top-[60%] left-[10%] w-8 h-8 bg-primary/5 rounded-full blur-sm" />
          <div className="absolute top-[30%] right-[15%] w-16 h-16 border border-secondary/10 rounded-full" />
          <div className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-primary/5 rounded-md -rotate-12" />
        </div>

        <div className="z-10 max-w-7xl mx-auto w-full">
          {/* Badge Centered */}
          <div className="flex justify-center mb-16 animate-on-scroll">
            <div className="hero-badge inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase">
              Próximamente 2026
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-20 px-4">
            <div className="text-left animate-on-scroll lg:pr-10">
              <h1 className="hero-title text-5xl md:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.85] text-foreground">
                Donde las <br />
                <span className="text-primary italic font-serif">experiencias</span> <br /> 
                se hacen realidad.
              </h1>
            </div>

            <div className="hidden lg:block relative h-[500px] animate-on-scroll">
              <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl rounded-[4rem] border border-foreground/10 overflow-hidden p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                    <div className="w-3 h-3 rounded-full bg-green-400/30" />
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-bold tracking-widest uppercase text-foreground/40">
                    Dashboard Demo v2.0
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 bg-background/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-foreground/5">
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="h-3 w-32 bg-foreground/5 rounded-full" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-6 w-full bg-foreground/5 rounded-xl" />
                      <div className="h-6 w-3/4 bg-foreground/5 rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="bg-background/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-foreground/5 aspect-square flex flex-col">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="mt-auto h-28 w-full bg-linear-to-t from-secondary/5 to-transparent rounded-2xl flex items-end px-3 pb-3 gap-1.5">
                      <div className="h-1/2 flex-1 bg-secondary/20 rounded-t-lg" />
                      <div className="h-3/4 flex-1 bg-secondary/30 rounded-t-lg" />
                      <div className="h-1/3 flex-1 bg-secondary/20 rounded-t-lg" />
                      <div className="h-full flex-1 bg-secondary/40 rounded-t-lg" />
                    </div>
                  </div>

                  <div className="bg-background/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-foreground/5 aspect-square">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground/5" />
                        <div className="h-3 flex-1 bg-foreground/5 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground/5" />
                        <div className="h-3 flex-1 bg-foreground/5 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground/5" />
                        <div className="h-3 flex-1 bg-foreground/5 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-10 -right-10 px-8 py-6 bg-background rounded-3xl shadow-2xl border border-foreground/10 animate-pulse">
                <div className="text-[10px] font-bold text-foreground/30 mb-2 uppercase tracking-widest">INGRESOS HOY</div>
                <div className="text-3xl font-bold text-primary">$1,240.00</div>
              </div>

              <div className="absolute -bottom-10 -left-10 px-8 py-6 bg-background rounded-3xl shadow-2xl border border-foreground/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 overflow-hidden border-4 border-background shadow-sm flex items-center justify-center text-white font-bold text-sm uppercase">
                    JK
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">NUEVA RESERVA</div>
                    <div className="text-sm font-bold text-foreground">Laboratorio Zombie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description and CTA Centered Below */}
          <div className="max-w-4xl mx-auto text-center px-6 animate-on-scroll">
            <p className="hero-description text-xl md:text-2xl text-foreground/50 font-light leading-relaxed mb-12">
              La plataforma definitiva para gestionar, escalar y automatizar tu negocio de salas de escape. 
              Menos gestión, más aventura.
            </p>

            <div className="hero-cta flex flex-col items-center gap-8">
              <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl sm:rounded-full bg-background/50 backdrop-blur-md border border-foreground/10 shadow-xl hover:shadow-2xl transition-all">
                <input 
                  type="email" 
                  placeholder="tu@negocio.com"
                  className="w-full sm:flex-1 px-8 py-4 bg-transparent focus:outline-none text-foreground placeholder:text-foreground/30 text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold rounded-xl sm:rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-lg"
                >
                  Probar gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-foreground/40">
                <span className="flex items-center gap-2 text-primary/70"><CheckCircle2 className="w-5 h-5" /> Sin tarjeta necesaria</span>
                <span className="flex items-center gap-2 text-primary/70"><CheckCircle2 className="w-5 h-5" /> Instalación en 2 minutos</span>
              </div>
            </div>
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

      {/* Customization & Widgets Section */}
      <section ref={templatesRef} className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-on-scroll">
            <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight">Tu gestor, <span className="text-primary italic font-serif">tu estilo</span>.</h2>
            <p className="text-xl text-foreground/50 font-light leading-relaxed">
              No te limites a lo que te damos. Cambia el color, arrastra las herramientas y construye el panel de control perfecto para tu negocio.
            </p>
          </div>

          {/* Theme Switcher Preview */}
          <div className="mb-32 animate-on-scroll">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTheme(t)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${activeTheme === t ? 'border-primary bg-primary/5 shadow-lg' : 'border-foreground/5 bg-background/50 hover:border-primary/20'}`}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: THEMES[t].primary }} />
                  <span className={`text-sm font-bold ${activeTheme === t ? 'text-primary' : 'text-foreground/40'}`}>
                    {THEMES[t].name}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative p-2 rounded-[3rem] bg-background border border-foreground/10 shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 grid-pattern opacity-20" />
               <div className="relative z-10 p-8 md:p-12">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                      Panel Personalizado
                    </div>
                  </div>

                  <div 
                    className="flex flex-wrap gap-6 min-h-[500px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                      const toIndex = widgets.length - 1; 
                      const newWidgets = [...widgets];
                      const [moved] = newWidgets.splice(fromIndex, 1);
                      newWidgets.splice(toIndex, 0, moved);
                      setWidgets(newWidgets);
                    }}
                  >
                    {widgets.map((w, i) => (
                      <div 
                        key={w.id} 
                        id={`widget-${w.id}`}
                        style={{ width: w.width, height: w.height }}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", i.toString())}
                        className={`group/widget relative p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-xl border border-foreground/10 shadow-xl hover:shadow-2xl transition-all cursor-move flex flex-col overflow-hidden`}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className={`p-4 rounded-2xl ${w.color}`}>
                            <w.Icon size={24} />
                          </div>
                          <div className="flex items-center gap-2">
                             <GripHorizontal className="text-foreground/10 group-hover/widget:text-foreground/30 transition-colors" size={20} />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-foreground mb-2">{w.title}</h4>
                        <p className="text-md text-foreground/50 font-light mb-auto">
                          {w.id === 'stats' && w.content === 'mensual' ? 'Ingresos totales: 12.400€' : w.id === 'stats' ? 'Ingresos hoy: 450€' : w.content}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.03]">
                          <button 
                            onClick={() => {
                              const newWidgets = [...widgets];
                              if (w.id === 'stats') {
                                newWidgets[i].content = newWidgets[i].content === 'mensual' ? 'diario' : 'mensual';
                              } else {
                                newWidgets[i].content = "Personalizado";
                              }
                              setWidgets(newWidgets);
                            }}
                            className="text-[10px] font-bold uppercase tracking-tighter text-primary flex items-center gap-1 hover:gap-2 transition-all"
                          >
                            Configurar <Settings2 size={10} />
                          </button>
                        </div>

                        {/* Resize Handle */}
                        <div 
                          className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize flex items-end justify-end p-2 opacity-0 group-hover/widget:opacity-100 transition-opacity z-20"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setResizingWidget(w.id);
                            setResizeStart({ x: e.clientX, y: e.clientY, w: w.width, h: w.height });
                          }}
                        >
                          <div className="w-4 h-4 rounded-tl-full border-b-2 border-r-2 border-primary/40 mr-1 mb-1" />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
             <div className="animate-on-scroll col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Brush size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Paletas de UI-Kit</h3>
                <p className="text-foreground/50 font-light leading-relaxed">
                  Utilizamos el sistema de diseño de nuestro UI-Kit oficial para garantizar que cada tema sea accesible y profesional.
                </p>
             </div>
             <div className="animate-on-scroll col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                  <Layout size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Widgets Modulares</h3>
                <p className="text-foreground/50 font-light leading-relaxed">
                  Organiza tu espacio de trabajo como quieras. Prioriza el calendario, las finanzas o el rendimiento de tus Game Masters.
                </p>
             </div>
             <div className="animate-on-scroll col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <Rocket size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Marca Blanca</h3>
                <p className="text-foreground/50 font-light leading-relaxed">
                  Tu logo, tus fuentes, tu dominio. EscapeMaster desaparece para que tu marca sea la protagonista.
                </p>
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

      {/* Testimonials section */}
      <section ref={testimonialsRef} className="relative py-32 px-6 z-10 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-on-scroll">
            <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight">Lo que dicen los <span className="text-primary italic font-serif">equipos</span>.</h2>
            <p className="text-xl text-foreground/50 font-light">
              Cientos de salas de escape están esperando el lanzamiento para cambiar su forma de trabajar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Finalmente una herramienta pensada por y para Game Masters. La automatización de correos nos va a salvar horas cada semana.",
                author: "Carlos R.",
                role: "Dueño de 'El Enigma'",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
              },
              {
                text: "El diseño es impecable. Se nota que han cuidado la experiencia del usuario final tanto como la del administrador.",
                author: "Lucía M.",
                role: "Directora de Operaciones",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia"
              },
              {
                text: "Gestionar 5 sedes ahora es posible desde una sola pantalla. El panel de métricas es simplemente revolucionario.",
                author: "Marc S.",
                role: "Fundador de EscapeWorld",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc"
              }
            ].map((t, i) => (
              <div key={i} className="animate-on-scroll p-10 rounded-[2.5rem] bg-background border border-foreground/10 shadow-sm hover:shadow-xl transition-all">
                <div className="flex gap-1 text-secondary mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg text-foreground/70 italic mb-8 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full border border-foreground/10 bg-primary/5" />
                  <div>
                    <div className="font-bold text-foreground">{t.author}</div>
                    <div className="text-xs text-foreground/40 uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-on-scroll">
            <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight">Precios <span className="text-primary italic font-serif">honestos</span>.</h2>
            <p className="text-xl text-foreground/50 font-light">
              Sin comisiones ocultas por reserva. Elige el plan que mejor se adapte a tu escala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="animate-on-scroll relative p-12 rounded-[3.5rem] bg-background border border-foreground/10 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                 <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/30 group-hover:scale-110 transition-transform">
                   <Clock size={24} />
                 </div>
               </div>
               
               <div className="mb-12">
                 <h3 className="text-2xl font-bold text-foreground mb-4 italic font-serif">Gratis</h3>
                 <div className="flex items-baseline gap-1">
                   <span className="text-6xl font-bold tracking-tighter">0€</span>
                   <span className="text-foreground/40 font-medium">/para siempre</span>
                 </div>
                 <p className="mt-6 text-foreground/50 text-lg font-light leading-relaxed">
                   Ideal para salas que están empezando o para probar la plataforma sin compromiso.
                 </p>
               </div>

               <div className="space-y-4 mb-12">
                 {[
                   "Hasta 50 reservas/mes",
                   "1 Sede",
                   "Calendario básico",
                   "Emails transaccionales",
                   "Soporte por email"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="text-primary" size={20} />
                     <span className="text-foreground/70">{feat}</span>
                   </div>
                 ))}
               </div>

               <button className="w-full py-5 rounded-full border-2 border-foreground/10 text-foreground font-bold hover:bg-foreground hover:text-background transition-all text-lg">
                 Empezar ahora
               </button>
            </div>

            {/* Pro Plan */}
            <div className="animate-on-scroll relative p-12 rounded-[3.5rem] bg-background border-2 border-primary shadow-2xl transition-all group overflow-hidden">

               <div className="absolute top-0 right-0 p-8">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                   <Zap size={24} fill="currentColor" />
                 </div>
               </div>

               <div className="absolute top-0 left-0 p-8">
                 <span className="px-4 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest">Recomendado</span>
               </div>
               
               <div className="mb-12 pt-8">
                 <h3 className="text-2xl font-bold text-foreground mb-4 italic font-serif">Pro</h3>
                 <div className="flex items-baseline gap-1">
                   <span className="text-6xl font-bold tracking-tighter">49€</span>
                   <span className="text-foreground/40 font-medium">/mensual</span>
                 </div>
                 <p className="mt-6 text-foreground/50 text-lg font-light leading-relaxed">
                   Diseñado para salas consolidadas que necesitan funciones avanzadas y escalabilidad.
                 </p>
               </div>

               <div className="space-y-4 mb-12">
                 {[
                   "Reservas ilimitadas",
                   "Sedes ilimitadas (+10€/sede extra)",
                   "Analíticas avanzadas",
                   "Automatizaciones custom",
                   "App Móvil incluida",
                   "Soporte prioritario 24/7"
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="text-primary" size={20} />
                     <span className="text-foreground/70 font-medium">{feat}</span>
                   </div>
                 ))}
               </div>

               <button className="w-full py-5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-lg">
                 Probar 14 días gratis
               </button>
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
