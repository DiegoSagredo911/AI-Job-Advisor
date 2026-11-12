import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { ApiKeyProvider } from "@/context/api-key-context";
import { ProfileProvider } from "@/context/profile-context";
import { NavigationBar } from "@/components/navigation-bar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090a0f",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai-job-advisor.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Job Advisor",
  alternateName: ["Asesor Inteligente de Postulaciones", "AI Job Copilot"],
  description:
    "Plataforma inteligente universal para análisis de vacantes, calce técnico ATS, personalización de CVs a formato Harvard en Word (.docx) y simulador de entrevistas con IA por voz.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  inLanguage: "es",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Diego Ignacio Sagredo Ailef",
    url: "https://www.linkedin.com/in/diego-sagredo/",
  },
  featureList: [
    "Simulador de entrevistas técnicas con voz en tiempo real",
    "Análisis de compatibilidad y filtros ATS",
    "Generador y exportador de currículum formato Harvard en Word (.docx)",
    "Redacción automática de cartas de presentación y cold pitch",
    "Cascada de tolerancia a fallos con modelos Google Gemini Flash",
    "Memoria local persistente SHA-256",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Job Advisor | Asesor Inteligente de Postulaciones y Carrera con IA",
    template: "%s | AI Job Advisor",
  },
  description:
    "Optimiza tu CV a formato Harvard en Word (.docx), evalúa vacantes contra filtros ATS, redacta cartas persuasivas y practica entrevistas técnicas con IA por voz.",
  keywords: [
    "asesor de empleo ia",
    "simulador de entrevistas con ia",
    "analizador de cv ats",
    "curriculum vitae formato harvard word docx",
    "optimizador de postulaciones laborales",
    "match score cv vacante",
    "simulador de entrevistas tecnicas con voz",
    "google gemini job advisor",
    "preparador de entrevistas de trabajo",
    "redactor de cartas de presentacion ia",
    "ats resume checker gratis",
    "postulaciones laborales ia",
    "job interview simulator ai",
    "harvard resume generator",
  ],
  authors: [
    {
      name: "Diego Ignacio Sagredo Ailef",
      url: "https://www.linkedin.com/in/diego-sagredo/",
    },
  ],
  creator: "Diego Ignacio Sagredo Ailef",
  publisher: "Diego Ignacio Sagredo Ailef",
  applicationName: "AI Job Advisor",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    alternateLocale: ["es_ES", "en_US"],
    url: siteUrl,
    siteName: "AI Job Advisor",
    title: "AI Job Advisor | Copiloto Inteligente de Postulaciones y Carrera",
    description:
      "Optimiza tu CV a formato Harvard (.docx), supera filtros ATS y practica entrevistas técnicas con voz impulsado por Google Gemini.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Job Advisor | Asesor Inteligente de Carrera con IA",
    description:
      "Optimiza tu CV a formato Harvard en Word, supera filtros ATS y simula entrevistas con voz real.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white max-w-[100vw] overflow-x-hidden">
        <ApiKeyProvider>
          <ProfileProvider>
            <NavigationBar />
          {/* pb-24 on mobile leaves safe room for the mobile bottom navigation bar */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0 overflow-x-hidden">
            {children}
          </main>
          <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-1.5 mb-16 md:mb-0">
            <p className="break-words flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span>
                Creado y Desarrollado por{" "}
                <a
                  href="https://www.linkedin.com/in/diego-sagredo/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-blue-400 font-semibold underline underline-offset-2"
                >
                  Diego Ignacio Sagredo Ailef (LinkedIn)
                </a>
              </span>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-blue-400 font-semibold underline underline-offset-2 transition-colors"
              >
                Términos y Condiciones de Uso
              </Link>
            </p>
            <p className="text-[11px] text-slate-600 break-words">
              Licencia GNU GPL v3 (Uso Libre y Comunitario · Sin Fines de Lucro / Prohibida su Venta · Modificaciones deben ser Públicas bajo la Misma Licencia)
            </p>
          </footer>
        </ProfileProvider>
      </ApiKeyProvider>
    </body>
  </html>
  );
}
