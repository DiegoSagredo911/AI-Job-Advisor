"use client";

import React from "react";
import { MockInterview } from "@/components/mock-interview";
import { useProfile } from "@/context/profile-context";
import { MessageSquareCode } from "lucide-react";

export default function InterviewPage() {
  const { activeProfile } = useProfile();

  return (
    <div className="space-y-3 sm:space-y-6 w-full max-w-full min-w-0">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-lg sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <MessageSquareCode className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
          <span>Simulador de Entrevistas</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
          Entrena tus respuestas para entrevistas con reclutadores y líderes de tu área. La IA
          evaluará tu claridad, rigor metodológico y te dará retroalimentación instantánea.
        </p>
      </div>

      <MockInterview
        initialJobContext={
          activeProfile?.headline
            ? `${activeProfile.headline}${activeProfile.fullName ? ` - ${activeProfile.fullName}` : ""}`
            : "Entrevista Profesional & Técnica"
        }
      />
    </div>
  );
}
