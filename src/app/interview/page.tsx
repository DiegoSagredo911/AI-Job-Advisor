"use client";

import React from "react";
import { MockInterview } from "@/components/mock-interview";
import { useProfile } from "@/context/profile-context";
import { MessageSquareCode, Sparkles } from "lucide-react";

export default function InterviewPage() {
  const { activeProfile, activeSlug } = useProfile();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <MessageSquareCode className="w-7 h-7 text-indigo-400" />
          <span>Simulador de Entrevistas Profesionales</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
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
