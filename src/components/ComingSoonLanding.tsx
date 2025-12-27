"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ComingSoonLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
      .fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      );

    // Floating elements animation
    if (floatingRef.current) {
      const elements = floatingRef.current.children;
      Array.from(elements).forEach((el, i) => {
        gsap.to(el, {
          y: "random(-20, 20)",
          x: "random(-20, 20)",
          rotation: "random(-15, 15)",
          duration: "random(2, 4)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2,
        });
      });
    }
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 overflow-hidden relative"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Floating Decorative Elements */}
      <div ref={floatingRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-12 h-12 border border-white/10 rounded-lg rotate-12" />
        <div className="absolute top-[60%] left-[10%] w-8 h-8 bg-primary/20 rounded-full blur-sm" />
        <div className="absolute top-[30%] right-[15%] w-16 h-16 border border-primary/20 rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-white/5 rounded-md -rotate-12" />
      </div>

      <div className="z-10 text-center max-w-3xl">
        <div
          ref={badgeRef}
          className="inline-block px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium tracking-wider uppercase"
        >
          En Desarrollo
        </div>
        
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
        >
          ESCAPEMASTER
        </h1>
        
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed mb-12"
        >
          La plataforma definitiva para la gestión de salas de escape está en camino. 
          Estamos construyendo algo increíble para llevar tu negocio al siguiente nivel.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-[1px] bg-zinc-800" />
          <span className="text-zinc-500 text-sm uppercase tracking-[0.2em]">Próximamente 2026</span>
        </div>
      </div>

      {/* Footer-like info without links */}
      <div className="absolute bottom-12 left-0 right-0 text-center text-zinc-600 text-xs tracking-widest uppercase">
        © 2025 EscapeMaster. Todos los derechos reservados.
      </div>
    </div>
  );
};

export default ComingSoonLanding;
