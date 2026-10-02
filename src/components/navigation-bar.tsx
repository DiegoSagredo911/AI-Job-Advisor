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
    { href: "/", label: "Mis Postulaciones", icon: Briefcase },
    { href: "/jobs", label: "Buscar Vacantes", icon: Search },
    { href: "/analyze", label: "Analizar Vacante", icon: FileSearch },
    { href: "/interview", label: "Simulador de Entrevista", icon: MessageSquareCode },
    { href: "/profiles", label: "Perfil & Documentos", icon: UserCog },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                AI Job Advisor
              </span>
              <span className="text-[10px] text-blue-400 font-medium -mt-1 block">
                Asesor de Postulaciones & Carrera
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
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
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSetupOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cargar Mi Perfil</span>
            </button>
            <ProfileSwitcher />
          </div>
        </div>
      </header>

      <QuickSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />
    </>
  );
}
