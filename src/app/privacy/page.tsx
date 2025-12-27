import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-12 transition-colors"
        >
          <ArrowLeft size={20} /> Volver al inicio
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Política de Privacidad</h1>
        
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Información General</h2>
            <p>
              EscapeMaster se compromete a proteger la privacidad de sus usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos su información personal al utilizar nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Datos que Recopilamos</h2>
            <p>Recopilamos información que usted nos proporciona directamente:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Información de contacto:</strong> Correo electrónico al unirse a nuestra lista de espera o crear una cuenta.</li>
              <li><strong>Información de perfil:</strong> Nombre completo y detalles de la organización al registrarse como administrador.</li>
              <li><strong>Datos de uso:</strong> Información sobre cómo interactúa con nuestra plataforma para mejorar nuestros servicios.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Uso de la Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Proporcionar y mantener nuestros servicios.</li>
              <li>Notificarle sobre cambios en nuestra plataforma o lanzamientos.</li>
              <li>Brindar soporte técnico y atención al cliente.</li>
              <li>Analizar el uso de la plataforma para optimizar la experiencia del usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra el acceso no autorizado, la pérdida o la alteración. Sus datos se almacenan de forma segura utilizando servicios de infraestructura de primer nivel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a acceder, rectificar, suprimir o limitar el tratamiento de sus datos personales. Para ejercer estos derechos, puede ponerse en contacto con nosotros a través de los canales oficiales proporcionados en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cambios en esta Política</h2>
            <p>
              Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos cualquier cambio publicando la nueva política en esta página.
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-zinc-800 text-zinc-500 text-sm">
          Última actualización: 27 de diciembre de 2025
        </footer>
      </div>
    </div>
  );
}
