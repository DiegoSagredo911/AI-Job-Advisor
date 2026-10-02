"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileSwitcher } from "./profile-switcher";
import { QuickSetupModal } from "./quick-setup-modal";
import { Sparkles, Briefcase, FileSearch, MessageSquareCode, UserCog, Search } from "lucide-react";

export function NavigationBar() {
  const pathname = usePathname();
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Mis Postulaciones", shortLabel: "Inicio", icon: Briefcase },
    { href: "/jobs", label: "Buscar Vacantes", shortLabel: "Vacantes", icon: Search },
    { href: "/analyze", label: "Analizar Vacante", shortLabel: "Analizar", icon: FileSearch },
    { href: "/interview", label: "Simulador de Entrevista", shortLabel: "Entrevista", icon: MessageSquareCode },
    { href: "/profiles", label: "Perfil & Documentos", shortLabel: "Perfil", icon: UserCog },
  ];

  return (
    <>
      {/* Top Header for Desktop & Mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 group min-w-0 shrink">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 truncate">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block leading-tight truncate">
                AI Job Advisor
              </span>
              <span className="text-[9px] sm:text-[10px] text-blue-400 font-medium block truncate hidden xs:block">
                Asesor de Carrera con IA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-800 text-blue-400 border border-slate-700"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSetupOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
              title="Cargar tu CV y datos personales"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cargar Mi Perfil</span>
            </button>
            <ProfileSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for phones) */}
      <nav
        aria-label="Navegación Móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl max-w-full overflow-hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all min-w-0 ${
                isActive
                  ? "text-blue-400 font-bold bg-blue-950/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-blue-400 scale-110" : "text-slate-400"} transition-transform`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-75" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none text-center truncate max-w-full px-0.5 block">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      <QuickSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />
    </>
  );
}
