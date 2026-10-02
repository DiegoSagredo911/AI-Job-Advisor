"use client";

import React, { useState } from "react";
import { OutreachPitch } from "@/types/advisor";
import { Copy, Check, MessageSquare, Mail, Send } from "lucide-react";

interface OutreachViewerProps {
  outreach: OutreachPitch;
}

export function OutreachViewer({ outreach }: OutreachViewerProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* 1. LinkedIn Connection Note */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Nota para Solicitud de Conexión en LinkedIn
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              {outreach.linkedInConnectionNote?.length || 0} / 300 caracteres
            </span>
            <button
              onClick={() => copyText(outreach.linkedInConnectionNote, "note")}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedSection === "note" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap break-words [word-break:break-word] overflow-hidden">
          {outreach.linkedInConnectionNote}
        </div>
      </div>

      {/* 2. InMail / Cold Pitch to Hiring Manager */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Mensaje Directo InMail / Reclutador o Tech Lead
            </h3>
          </div>
          <button
            onClick={() => copyText(outreach.linkedInInMailMessage, "inmail")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copiedSection === "inmail" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap break-words [word-break:break-word] overflow-hidden">
          {outreach.linkedInInMailMessage}
        </div>
      </div>

      {/* 3. Formal Cover Letter */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Carta de Presentación Formal (Cover Letter)
            </h3>
          </div>
          <button
            onClick={() => copyText(outreach.emailCoverLetter, "letter")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copiedSection === "letter" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
        <div className="p-3.5 sm:p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap break-words [word-break:break-word] overflow-hidden">
          {outreach.emailCoverLetter}
        </div>
      </div>
    </div>
  );
}
