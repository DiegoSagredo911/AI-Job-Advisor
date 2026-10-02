import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProfileProvider } from "@/context/profile-context";
import { NavigationBar } from "@/components/navigation-bar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090a0f",
};

export const metadata: Metadata = {
  title: "AI Job Advisor | Asesor Inteligente de Postulaciones",
  description:
    "Plataforma inteligente para análisis de vacantes, calce técnico ATS, personalización de CVs y simulador de entrevistas técnicas para Diego Sagredo y profesionales de ingeniería.",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark overflow-x-hidden">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white max-w-[100vw] overflow-x-hidden">
        <ProfileProvider>
          <NavigationBar />
          {/* pb-24 on mobile leaves safe room for the mobile bottom navigation bar */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0 overflow-x-hidden">
            {children}
          </main>
          <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-1 mb-16 md:mb-0">
            <p className="break-words">
              Creado y Desarrollado por{" "}
              <a
                href="https://www.linkedin.com/in/diego-sagredo/"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-400 font-semibold underline underline-offset-2"
              >
                Diego Ignacio Sagredo Ailef (LinkedIn)
              </a>
            </p>
            <p className="text-[11px] text-slate-600 break-words">
              Licencia GNU GPL v3 (Uso Libre y Comunitario · Sin Fines de Lucro / Prohibida su Venta · Modificaciones deben ser Públicas bajo la Misma Licencia)
            </p>
          </footer>
        </ProfileProvider>
      </body>
    </html>
  );
}
