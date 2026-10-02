"use client";

import React, { useState } from "react";
import { TailoredResume } from "@/types/advisor";
import { useProfile } from "@/context/profile-context";
import {
  Copy,
  Check,
  Printer,
  FileText,
  Download,
  Loader2,
  FileEdit,
  FileSpreadsheet,
} from "lucide-react";

import axios from "axios";

interface ResumeViewerProps {
  resume: TailoredResume;
  applicationId?: string;
}

export function ResumeViewer({ resume, applicationId }: ResumeViewerProps) {
  const { activeSlug, activeProfile } = useProfile();
  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState<"harvard" | "ats" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(resume.markdownResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = async (format: "harvard" | "ats") => {
    if (!activeSlug || downloadingDocx) return;
    setDownloadingDocx(format);

    try {
      const response = await axios.post(
        "/api/export/docx",
        {
          profileSlug: activeSlug,
          applicationId,
          format,
          customResume: resume,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (activeProfile?.fullName || "curriculum")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      a.download = `CV_${format.toUpperCase()}_Adaptado_${safeName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading docx with axios:", err);
      alert("Error al descargar el archivo Word editable.");
    } finally {
      setDownloadingDocx(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>CV Optimizado para la Vacante</span>
          </div>
          <div className="text-xs text-slate-400">
            Rol enfocado: <span className="text-slate-200">{resume.targetedRole}</span>
          </div>
        </div>

        {/* Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Harvard Word Download */}
          <button
            onClick={() => handleDownloadDocx("harvard")}
            disabled={downloadingDocx !== null}
            title="Descargar en formato Harvard clásico (.docx editable con Times New Roman, márgenes y líneas divisorias)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors shadow-sm disabled:opacity-50"
          >
            {downloadingDocx === "harvard" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Word Formato Harvard</span>
          </button>

          {/* ATS Word Download */}
          <button
            onClick={() => handleDownloadDocx("ats")}
            disabled={downloadingDocx !== null}
            title="Descargar en formato ATS estándar (.docx editable limpio con Calibri y alta legibilidad para parsers de RRHH)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors shadow-sm disabled:opacity-50"
          >
            {downloadingDocx === "ats" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Word Formato ATS</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* Editable Word Notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400">
        <FileEdit className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>
          💡 <strong>100% Editable en Word:</strong> Descarga el archivo en <strong>Formato Harvard</strong> o <strong>Formato ATS</strong> para abrirlo en Microsoft Word, Google Docs o LibreOffice, retocar cualquier detalle a tu gusto y guardarlo como PDF final.
        </span>
      </div>

      {/* Skills Highlight Bar */}
      {resume.highlightedSkills && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-800 bg-slate-900/40">
          <span className="text-xs text-slate-400 self-center mr-1">Skills Priorizados para esta Vacante:</span>
          {resume.highlightedSkills.map((s, idx) => (
            <span
              key={idx}
              className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Rendered Resume Document (Live Preview) */}
      <div className="p-8 sm:p-10 rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-100 font-sans shadow-lg space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Professional Summary */}
        <div className="space-y-2 border-b border-slate-800 pb-4 print:border-black">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-blue-700">
            Resumen Profesional Dirigido
          </h3>
          <p className="text-sm leading-relaxed text-slate-200 print:text-gray-800">
            {resume.professionalSummary}
          </p>
        </div>

        {/* Custom Experience */}
        {resume.customExperience && (
          <div className="space-y-4 border-b border-slate-800 pb-4 print:border-black">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-blue-700">
              Experiencia Laboral Relevante
            </h3>
            <div className="space-y-4">
              {resume.customExperience.map((exp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-white print:text-black">
                      {exp.role} — <span className="text-blue-300 print:text-blue-800">{exp.company}</span>
                    </span>
                    <span className="text-xs text-slate-400 print:text-gray-600 font-mono">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {exp.bulletPoints.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-300 print:text-gray-700 flex items-start gap-2">
                        <span className="text-blue-400 print:text-blue-700 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relevant Projects */}
        {resume.relevantProjects && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-blue-700">
              Proyectos de Alto Impacto
            </h3>
            <div className="space-y-3">
              {resume.relevantProjects.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-sm font-bold text-white print:text-black">
                    {p.name}
                  </div>
                  <ul className="space-y-1">
                    {p.bulletPoints.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-300 print:text-gray-700 flex items-start gap-2">
                        <span className="text-blue-400 print:text-blue-700 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
