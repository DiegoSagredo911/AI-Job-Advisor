"use client";

import React from "react";
import { useProfile } from "@/context/profile-context";
import { User } from "lucide-react";
import Link from "next/link";

export function ProfileSwitcher() {
  const { activeProfile } = useProfile();

  const initial = activeProfile?.fullName ? activeProfile.fullName.charAt(0).toUpperCase() : "P";
  const displayName = activeProfile?.fullName || "Mi Perfil";

  return (
    <Link
      href="/profiles"
      title="Ir a Mi Perfil & Documentos"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-sm font-medium transition-colors text-slate-200 group"
    >
      <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/40 group-hover:bg-blue-600/40 transition-colors">
        {initial}
      </div>
      <div className="text-left hidden sm:block">
        <div className="text-[10px] text-slate-400 leading-none">Mi Perfil</div>
        <div className="text-xs font-semibold text-slate-100 truncate max-w-[130px] leading-tight mt-0.5">
          {displayName}
        </div>
      </div>
      <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors ml-0.5" />
    </Link>
  );
}
