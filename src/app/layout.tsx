import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "EscapeMaster | El Software de Gestión Definitivo para Escape Rooms",
  description: "Optimiza tu Escape Room con el sistema de reservas y gestión más avanzado. Calendario inteligente, automatizaciones, estadísticas detalladas y soporte 24/7. ¡Lanza tu negocio al siguiente nivel!",
  keywords: ["escape room software", "software gestión escape room", "reservas escape room", "calendario escape room", "mejor software escape room", "crm escape room"],
  authors: [{ name: "EscapeMaster Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://escapemaster.io", 
    siteName: "EscapeMaster",
    title: "EscapeMaster | Potencia tu Escape Room",
    description: "La herramienta líder para gestionar centros de ocio y salas de escape. Automatiza, escala y mejora la experiencia de tus clientes.",
    images: [
      {
        url: "/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "EscapeMaster Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EscapeMaster | El mejor software para Escape Rooms",
    description: "Todo lo que necesitas para gestionar tus salas en un solo lugar. Reservas, pagos y analíticas.",
    images: ["/dashboard-preview.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
