"use client";

import React, { useState } from "react";
import { JobAnalysisResult } from "@/types/advisor";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  Sparkles,
  Briefcase,
  HelpCircle,
  Copy,
  Check,
  Globe2,
} from "lucide-react";

interface MatchScoreCardProps {
  analysis: JobAnalysisResult;
}

export function MatchScoreCard({ analysis }: MatchScoreCardProps) {
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const score = analysis.matchScore || 0;
  const isEnglish = analysis.detectedLanguage === "en";

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(index);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  // Determine score color
  const getScoreColor = (num: number) => {
    if (num >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    if (num >= 60) return "text-blue-400 border-blue-500/30 bg-blue-950/20";
    return "text-amber-400 border-amber-500/30 bg-amber-950/20";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Score & Summary */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/40">
              {analysis.seniorityLevel}
            </span>
            <span className="text-xs text-slate-400">
              {analysis.companyName || "Empresa"}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isEnglish 
                ? "bg-amber-950/40 text-amber-300 border-amber-800/40" 
                : "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
            }`}>
              <Globe2 className="w-3 h-3" />
              <span>{isEnglish ? "🇺🇸 English Vacancy" : "🇪🇸 Vacante en Español"}</span>
            </span>
            {analysis.modelUsed && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
                ⚡ {analysis.modelUsed}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {analysis.jobTitle}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {analysis.fitSummary}
          </p>
        </div>

        {/* Circular / Badge Score */}
        <div className={`p-4 rounded-2xl border text-center shrink-0 w-full md:w-36 ${getScoreColor(score)}`}>
          <div className="text-4xl font-extrabold tracking-tight">{score}%</div>
          <div className="text-xs font-medium uppercase tracking-wider mt-1 text-slate-400">
            Calce Técnico
          </div>
        </div>
      </div>

      {/* Grid: Strengths vs Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/10 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tus Mayores Fortalezas para esta Vacante</span>
          </h3>
          <ul className="space-y-2">
            {analysis.keyStrengths?.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing / Gaps */}
        <div className="p-5 rounded-xl border border-amber-900/40 bg-amber-950/10 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Brechas Identificadas & Cómo Mitigarlas</span>
          </h3>
          <ul className="space-y-2">
            {analysis.missingGaps?.map((gap, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Projects to Highlight */}
      {analysis.recommendedProjects && analysis.recommendedProjects.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Proyectos Clave de tu Trayectoria a Destacar</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.recommendedProjects.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2"
              >
                <div className="font-semibold text-blue-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{p.projectName}</span>
                </div>
                <p className="text-xs text-slate-300">{p.whyRelevant}</p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-semibold text-emerald-400">Argumento en entrevista: </span>
                  {p.talkingPoint}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Keywords */}
      {analysis.atsKeywords && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Optimización de Palabras Clave ATS</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {analysis.atsKeywords.criticalMatches?.map((kw, i) => (
              <span
                key={"m-" + i}
                className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300"
              >
                ✓ {kw}
              </span>
            ))}
            {analysis.atsKeywords.suggestedAdditions?.map((kw, i) => (
              <span
                key={"a-" + i}
                className="text-xs px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-300"
              >
                + Sugerido: {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tailored Strategy & Warning Areas */}
      {analysis.tailoredStrategy && (
        <div className="p-5 rounded-xl border border-blue-900/40 bg-blue-950/10 space-y-3">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span>Estrategia de Postulación & Preguntas Trampa</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.tailoredStrategy.approachAdvice}
          </p>

          {analysis.tailoredStrategy.interviewWarningAreas?.length > 0 && (
            <div className="pt-2 border-t border-blue-900/30 space-y-1.5">
              <span className="text-xs font-semibold text-slate-200">
                Preguntas difíciles que te harán en la entrevista:
              </span>
              <ul className="space-y-1">
                {analysis.tailoredStrategy.interviewWarningAreas.map((q, idx) => (
                  <li key={idx} className="text-xs text-slate-300 italic">
                    "{q}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reverse Interview: Strategic Questions for the Candidate to Ask */}
      {analysis.reverseInterviewQuestions && analysis.reverseInterviewQuestions.length > 0 && (
        <div className="p-6 rounded-2xl border border-purple-900/40 bg-purple-950/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span>Preguntas Estratégicas para el Entrevistador (Reverse Interview)</span>
            </h3>
            <span className="text-xs text-purple-400/80 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/30">
              Usa estas preguntas cuando digan: "¿Tienes alguna duda para nosotros?"
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Hacer preguntas perspicaces demuestra seniority, criterio técnico y visión de negocio, invirtiendo la dinámica a tu favor.
          </p>

          <div className="space-y-3 pt-1">
            {analysis.reverseInterviewQuestions.map((q, idx) => {
              const categoryBadge =
                q.category === "technical"
                  ? { label: "Técnica / Arquitectura", color: "bg-blue-950/60 text-blue-300 border-blue-800/40" }
                  : q.category === "culture"
                  ? { label: "Cultura & Liderazgo", color: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40" }
                  : { label: "Estrategia & Negocio", color: "bg-amber-950/60 text-amber-300 border-amber-800/40" };

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5 hover:border-purple-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${categoryBadge.color}`}>
                      {categoryBadge.label}
                    </span>
                    <button
                      onClick={() => handleCopyQuestion(q.question, idx)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
                      title="Copiar pregunta"
                    >
                      {copiedQuestionIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-100 italic">
                    "{q.question}"
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-purple-300">Por qué hacer esta pregunta: </span>
                      <span>{q.whyAskThis}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
