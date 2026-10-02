"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProfile } from "@/context/profile-context";
import { JobAnalysisResult, TailoredResume, OutreachPitch, JobApplication } from "@/types/advisor";
import { MatchScoreCard } from "@/components/match-score-card";
import { ResumeViewer } from "@/components/resume-viewer";
import { OutreachViewer } from "@/components/outreach-viewer";
import { MockInterview } from "@/components/mock-interview";
import {
  Sparkles,
  FileSearch,
  FileText,
  Send,
  MessageSquareCode,
  CheckCircle2,
  BookmarkPlus,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AnalyzePage() {
  const { activeSlug, activeProfile } = useProfile();
  const [jobText, setJobText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [resume, setResume] = useState<TailoredResume | null>(null);
  const [outreach, setOutreach] = useState<OutreachPitch | null>(null);
  const [savedAppId, setSavedAppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "resume" | "outreach" | "interview">("analysis");

  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingOutreach, setLoadingOutreach] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pending = localStorage.getItem("pendingJobDescription");
      if (pending) {
        setJobText(pending);
        localStorage.removeItem("pendingJobDescription");
      }
    }
  }, []);

  const sampleJobs = [
    {
      title: "Full Stack Developer (Next.js, Node.js & Real-time)",
      text: `Empresa de tecnología en rápido crecimiento busca Ingeniero Full Stack Senior / Semi-Senior.
Requisitos:
- Más de 3 años de experiencia con React.js, Next.js y TypeScript.
- Desarrollo backend con Node.js, Express y bases de datos relacionales (PostgreSQL).
- Experiencia en plataformas en tiempo real (WebSockets / Socket.io).
- Capacidad para diseñar arquitecturas escalables y tolerantes a fallos.
- Deseable: Experiencia en metodologías ágiles, cloud (AWS) y desarrollo asistido por IA.`,
    },
    {
      title: "Senior Backend / Cloud Engineer (.NET, SQL & Data)",
      text: `Empresa global busca Ingeniero de Software para sistemas de misión crítica.
Requisitos:
- Experiencia sólida en C# y .NET Framework / .NET Core.
- Modelado de bases de datos relacionales complejas y data warehouses (PostgreSQL, Redshift, SQL Server).
- Experiencia en optimización de consultas de alta analítica y reportes de KPIs empresariales.
- Manejo de infraestructura en la nube AWS y seguridad de aplicaciones.
- Buenas prácticas de Clean Architecture y resolución metódica de problemas.`,
    },
  ];

  const handleAnalyze = async () => {
    if (!jobText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setResume(null);
    setOutreach(null);
    setSavedAppId(null);
    setActiveTab("analysis");

    try {
      const { data } = await axios.post("/api/advisor/analyze", {
        profileSlug: activeSlug,
        rawJobDescription: jobText,
        saveAsApplication: true,
      });

      if (data.success) {
        setAnalysis(data.analysis);
        if (data.application) {
          setSavedAppId(data.application.id);
        }
      } else {
        alert(data.error || "Ocurrió un error al analizar la vacante.");
      }
    } catch (err: unknown) {
      console.error("Error analyzing job with axios:", err);
      alert("Error de conexión al procesar la oferta.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateResume = async () => {
    if (resume || loadingResume) return;
    setLoadingResume(true);
    try {
      const { data } = await axios.post("/api/advisor/tailor-resume", {
        profileSlug: activeSlug,
        rawJobDescription: jobText,
        applicationId: savedAppId,
      });
      if (data.success) {
        setResume(data.tailoredResume);
      }
    } catch (err) {
      console.error("Error tailoring resume with axios:", err);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (outreach || loadingOutreach) return;
    setLoadingOutreach(true);
    try {
      const { data } = await axios.post("/api/advisor/outreach", {
        profileSlug: activeSlug,
        rawJobDescription: jobText,
        applicationId: savedAppId,
      });
      if (data.success) {
        setOutreach(data.outreachPitch);
      }
    } catch (err) {
      console.error("Error generating outreach with axios:", err);
    } finally {
      setLoadingOutreach(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <FileSearch className="w-7 h-7 text-blue-500" />
          <span>Analizador Inteligente de Ofertas Laborales</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Evaluando contra:{" "}
          <strong className="text-slate-200">{activeProfile?.fullName || "Tu Perfil"}</strong>
        </p>
      </div>

      {/* Input Section */}
      <div className="p-4 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider">
            Descripción de la Oferta de Empleo (LinkedIn, Get on Board, etc.)
          </label>
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5 max-w-full min-w-0 w-full">
            <span className="text-slate-500 text-[11px] shrink-0">Ejemplos:</span>
            {sampleJobs.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setJobText(sample.text)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] border border-slate-700 transition-colors shrink-0"
              >
                {sample.title.split("(")[0]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Pega aquí la descripción completa de la vacante, requisitos técnicos, responsabilidades y empresa..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-[11px] text-slate-500">
            {jobText.length > 0 ? `${jobText.length} caracteres ingresados` : "Pega al menos 20 caracteres para evaluar"}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={jobText.trim().length < 20 || isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analizando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analizar Vacante & Compatibilidad</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section with Tabs */}
      {analysis && (
        <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
          {/* Navigation Tabs (Desplazables en móvil con swipe horizontal) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full max-w-full min-w-0">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === "analysis"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Informe de Calce ({analysis.matchScore}%)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("resume");
                  handleGenerateResume();
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === "resume"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CV Adaptado</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("outreach");
                  handleGenerateOutreach();
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === "outreach"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pitches & Cover Letter</span>
              </button>

              <button
                onClick={() => setActiveTab("interview")}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === "interview"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Simulador de Entrevista</span>
              </button>
            </div>

            {savedAppId && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardado en Mis Postulaciones</span>
              </div>
            )}
          </div>

          {/* Tab 1: Analysis */}
          {activeTab === "analysis" && <MatchScoreCard analysis={analysis} />}

          {/* Tab 2: Tailored Resume */}
          {activeTab === "resume" && (
            <div>
              {loadingResume ? (
                <div className="p-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-xs text-slate-400">
                    Generando versión optimizada del CV con palabras clave ATS para esta vacante...
                  </p>
                </div>
              ) : resume ? (
                <ResumeViewer resume={resume} applicationId={savedAppId || undefined} />
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={handleGenerateResume}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Generar CV Optimizado Ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Outreach */}
          {activeTab === "outreach" && (
            <div>
              {loadingOutreach ? (
                <div className="p-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-xs text-slate-400">
                    Redactando nota de LinkedIn, mensaje cold pitch y carta de presentación...
                  </p>
                </div>
              ) : outreach ? (
                <OutreachViewer outreach={outreach} />
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={handleGenerateOutreach}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Generar Mensajes de Contacto Ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Mock Interview */}
          {activeTab === "interview" && (
            <MockInterview
              initialJobContext={`${analysis.jobTitle} en ${analysis.companyName || "la empresa"}`}
              applicationId={savedAppId || undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
