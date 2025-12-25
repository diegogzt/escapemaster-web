"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Zap,
  Shield,
  BarChart3,
  Users,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const links = [
    { name: "Características", href: "#features" },
    { name: "Precios", href: "#pricing" },
    { name: "Nosotros", href: "#about" },
    { name: "Contacto", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="max-w-[1800px] mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter uppercase text-foreground"
        >
          EscapeMaster
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            INICIAR SESIÓN
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            EMPEZAR
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-t border-border p-6 flex flex-col gap-4 md:hidden shadow-xl">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-lg text-foreground hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          <Link href="/login" className="text-lg text-foreground">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="text-lg text-primary font-bold">
            Empezar
          </Link>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 lg:pt-32 overflow-hidden bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto w-full z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] lg:text-[7vw] leading-[0.9] font-bold tracking-tighter uppercase"
          >
            Escape
            <br />
            <span className="text-primary">Master</span>
          </motion.h1>

          <div className="mt-8 lg:mt-12 flex flex-col gap-8 border-t border-border pt-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xl md:text-2xl max-w-xl font-light text-muted-foreground"
            >
              El sistema de gestión definitivo para escape rooms. Optimiza
              reservas, gestiona personal y haz crecer tu negocio.
            </motion.p>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-4 text-xl font-medium text-foreground"
              >
                <span className="w-16 h-16 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </span>
                Prueba Gratis
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative hidden lg:block"
        >
          {/* Decorative Tropical Elements */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

          {/* Hero Image / Dashboard Preview Card */}
          <div className="relative z-10 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-700 max-w-2xl mx-auto">
            <img
              src="/hero-image.png"
              alt="EscapeMaster Dashboard"
              className="rounded-xl shadow-lg w-full h-auto object-cover"
            />
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-lg">
              +30% Reservas
            </div>
          </div>
        </motion.div>
      </div>

      {/* Abstract Background Elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 right-20 w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 left-20 w-[40vw] h-[40vw] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"
      />
    </section>
  );
};

const FeatureItem = ({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group border-t border-border py-12 md:py-20 flex flex-col md:flex-row gap-8 md:items-start hover:bg-secondary/10 transition-colors px-4"
    >
      <span className="text-sm font-mono text-muted-foreground">
        0{index + 1}
      </span>
      <div className="flex-1">
        <h3 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tight group-hover:translate-x-4 transition-transform duration-500 text-foreground">
          {title}
        </h3>
        <p className="text-xl text-muted-foreground max-w-2xl">{description}</p>
      </div>
      <div className="md:w-1/3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-primary">
        <ArrowRight className="w-12 h-12 -rotate-45" />
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      title: "Reservas Inteligentes",
      description:
        "Programación automatizada que evita conflictos y maximiza la capacidad.",
    },
    {
      title: "Gestión de Personal",
      description:
        "Controla horarios, asigna roles y gestiona nóminas sin esfuerzo.",
    },
    {
      title: "Analíticas",
      description:
        "Información en tiempo real sobre el rendimiento y crecimiento de tu negocio.",
    },
    {
      title: "CRM de Clientes",
      description:
        "Construye relaciones duraderas con perfiles de clientes e historial integrado.",
    },
  ];

  return (
    <section id="features" className="bg-background text-foreground py-32 px-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-20">
          <h2 className="text-sm font-mono text-muted-foreground mb-4 uppercase">
            Lo que hacemos
          </h2>
          <p className="text-3xl md:text-5xl max-w-4xl leading-tight">
            Proporcionamos la infraestructura para que los escape rooms modernos
            prosperen en un mundo digital.
          </p>
        </div>

        <div>
          {features.map((f, i) => (
            <FeatureItem key={i} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ParallaxImage = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div className="w-full h-[60vh] md:h-[80vh] overflow-hidden relative">
      <motion.div
        style={{ scale }}
        className="absolute inset-0 bg-[url('/experience-bg.png')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-[8vw] lg:text-[6vw] font-bold text-white uppercase tracking-tighter mb-4">
          Experiencia Inmersiva
        </h2>
        <p className="text-xl md:text-3xl text-white/90 max-w-3xl font-light">
          Gestiona cada detalle de la aventura para que tus clientes solo se
          preocupen por escapar.
        </p>
      </div>
    </div>
  );
};

const Pricing = () => {
  return (
    <section id="pricing" className="py-32 px-6 bg-secondary/10">
      <div className="max-w-[1800px] mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-12 uppercase tracking-tight text-foreground">
          Precios
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Básico",
              price: "29€",
              features: ["1 Sala", "Reservas Ilimitadas", "Soporte por Email"],
            },
            {
              name: "Pro",
              price: "79€",
              features: [
                "Hasta 3 Salas",
                "Analíticas Avanzadas",
                "Soporte Prioritario",
              ],
            },
            {
              name: "Enterprise",
              price: "Personalizado",
              features: [
                "Salas Ilimitadas",
                "API Personalizada",
                "Gestor de Cuenta",
              ],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className="border border-border p-8 rounded-2xl hover:bg-background transition-colors"
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6 text-primary">
                {plan.price}
                <span className="text-sm text-muted-foreground font-normal">
                  /mes
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-full border border-foreground hover:bg-foreground hover:text-background transition-colors font-medium">
                Elegir Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-32 px-6 bg-background">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row gap-20 items-center">
        <div className="flex-1">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tight text-foreground">
            Sobre Nosotros
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Nacimos de la pasión por los escape rooms y la necesidad de una
            gestión más eficiente.
          </p>
          <p className="text-xl text-muted-foreground">
            Nuestro equipo combina expertos en tecnología y propietarios de
            escape rooms para crear la solución definitiva que la industria
            necesitaba.
          </p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="bg-secondary/20 h-64 rounded-2xl flex items-center justify-center">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <div className="bg-secondary/20 h-64 rounded-2xl flex items-center justify-center mt-12">
            <Zap className="w-12 h-12 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formState, setFormState] = React.useState<
    "idle" | "submitting" | "success"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setFormState("success");
  };

  return (
    <section id="contact" className="py-32 px-6 bg-secondary/5">
      <div className="max-w-[1800px] mx-auto grid lg:grid-cols-2 gap-20 items-start">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tight text-foreground">
            Contáctanos
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-xl">
            ¿Tienes preguntas? Estamos aquí para ayudarte a llevar tu escape
            room al siguiente nivel. Nuestro equipo de soporte está disponible
            para resolver cualquier duda.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold uppercase mb-2">Email</h3>
              <a
                href="mailto:support@escapemaster.es"
                className="text-2xl text-primary hover:underline"
              >
                support@escapemaster.es
              </a>
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-2">Oficina</h3>
              <p className="text-xl text-muted-foreground">
                Calle de la Aventura 123
                <br />
                28001 Madrid, España
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background p-8 md:p-12 rounded-3xl border border-border shadow-sm">
          {formState === "success" ? (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">¡Mensaje enviado!</strong>
              <span className="block sm:inline">
                {" "}
                Nos pondremos en contacto contigo pronto.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {formState === "submitting" ? "Enviando..." : "Enviar Mensaje"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-32 pb-12 px-6 border-t border-border">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between gap-20">
        <div className="flex-1">
          <h2 className="text-[8vw] leading-[0.8] font-bold tracking-tighter uppercase mb-12">
            Trabajemos
            <br />
            Juntos
          </h2>
          <Link
            href="/register"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
          >
            Empieza Ahora
          </Link>
        </div>

        <div className="flex gap-20 flex-wrap">
          <div>
            <h4 className="font-mono text-muted-foreground mb-6 uppercase text-sm">
              Producto
            </h4>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  Características
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-foreground">
                  Integraciones
                </Link>
              </li>
              <li>
                <Link href="#changelog" className="hover:text-foreground">
                  Cambios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-muted-foreground mb-6 uppercase text-sm">
              Empresa
            </h4>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li>
                <Link href="#about" className="hover:text-foreground">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="#careers" className="hover:text-foreground">
                  Empleo
                </Link>
              </li>
              <li>
                <Link href="#blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-foreground">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-muted-foreground mb-6 uppercase text-sm">
              Redes
            </h4>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-muted-foreground mb-6 uppercase text-sm">
              Legal
            </h4>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-32 flex justify-between items-end text-sm text-muted-foreground font-mono uppercase">
        <div>© 2024 EscapeMaster Inc.</div>
        <div>Diseñado para el futuro</div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <main className="bg-background min-h-screen selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <Hero />
      <Features />
      <ParallaxImage />
      <Pricing />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
