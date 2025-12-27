import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-[#051c14] text-emerald-100/80 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-12 transition-colors"
        >
          <ArrowLeft size={20} /> Volver al inicio
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-200/50">Política de Cookies</h1>
        
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. ¿Qué son las Cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet o móvil) cuando visita un sitio web. Se utilizan ampliamente para que los sitios web funcionen de manera más eficiente y para proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Cómo utilizamos las Cookies</h2>
            <p>
              En EscapeMaster, utilizamos cookies principalmente para garantizar el funcionamiento técnico de la plataforma y mejorar su experiencia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Tipos de Cookies que utilizamos</h2>
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/10">
                <h3 className="text-lg font-bold text-white mb-2">Cookies Técnicas (Necesarias)</h3>
                <p className="text-sm">
                  Son esenciales para que pueda navegar por la plataforma y utilizar sus funciones. Por ejemplo, utilizamos una cookie de <strong>token</strong> para mantener su sesión iniciada de forma segura. Sin estas cookies, no podríamos proporcionar los servicios solicitados.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/10">
                <h3 className="text-lg font-bold text-white mb-2">Cookies de Preferencias</h3>
                <p className="text-sm">
                  Permiten que la plataforma recuerde información que cambia la forma en que se comporta o se ve el sitio, como su idioma preferido o el tema visual seleccionado (Tropical, Twilight, etc.).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/10">
                <h3 className="text-lg font-bold text-white mb-2">Cookies de Análisis</h3>
                <p className="text-sm">
                  Nos ayudan a comprender cómo los visitantes interactúan con la plataforma, recopilando y proporcionando información de forma anónima. Esto nos permite mejorar continuamente la estructura y el contenido de EscapeMaster.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Gestión de Cookies</h2>
            <p>
              Usted puede controlar y/o eliminar las cookies según desee. Puede eliminar todas las cookies que ya están en su ordenador y puede configurar la mayoría de los navegadores para que no se acepten. Sin embargo, si lo hace, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.
            </p>
            <p className="mt-4">
              Para modificar la configuración de cookies en su navegador, puede consultar las secciones de "Ayuda" o "Privacidad" del mismo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Más información</h2>
            <p>
              Si tiene alguna pregunta sobre nuestro uso de las cookies, puede ponerse en contacto con nosotros a través de los canales de soporte de EscapeMaster.
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-emerald-500/10 text-emerald-100/40 text-sm">
          Última actualización: 27 de diciembre de 2025
        </footer>
      </div>
    </div>
  );
}
