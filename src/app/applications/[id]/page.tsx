"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JobApplication } from "@/types/advisor";
import { MatchScoreCard } from "@/components/match-score-card";
import { ResumeViewer } from "@/components/resume-viewer";
import { OutreachViewer } from "@/components/outreach-viewer";
import { MockInterview } from "@/components/mock-interview";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Send,
  MessageSquareCode,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import axios from "axios";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analysis" | "resume" | "outreach" | "interview">("analysis");

  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingOutreach, setLoadingOutreach] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/applications/${id}`);
      if (data.success && data.application) {
        setApp(data.application);
      }
    } catch (err) {
      console.error("Error loading application with axios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus: JobApplication["status"]) => {
    if (!app) return;
    try {
      const updated = { ...app, status: newStatus };
      await axios.put(`/api/applications/${id}`, updated);
      setApp(updated);
    } catch (err) {
      console.error("Error updating application status with axios:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta postulación?")) return;
    try {
      const { data } = await axios.delete(`/api/applications/${id}`);
      if (data.success) {
        router.push("/");
      }
    } catch (err) {
      console.error("Error deleting application with axios:", err);
    }
  };

  const handleGenerateResume = async () => {
    if (!app || app.tailoredResume || loadingResume) return;
    setLoadingResume(true);
    try {
      const { data } = await axios.post("/api/advisor/tailor-resume", {
        profileSlug: app.profileSlug,
        applicationId: app.id,
      });
      if (data.success && data.tailoredResume) {
        setApp((prev) => (prev ? { ...prev, tailoredResume: data.tailoredResume } : prev));
      }
    } catch (err) {
      console.error("Error tailoring resume with axios:", err);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!app || app.outreachPitch || loadingOutreach) return;
    setLoadingOutreach(true);
    try {
      const { data } = await axios.post("/api/advisor/outreach", {
        profileSlug: app.profileSlug,
        applicationId: app.id,
      });
      if (data.success && data.outreachPitch) {
        setApp((prev) => (prev ? { ...prev, outreachPitch: data.outreachPitch } : prev));
      }
    } catch (err) {
      console.error("Error generating outreach with axios:", err);
    } finally {
      setLoadingOutreach(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span>Cargando detalles de la postulación...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm text-slate-300">Postulación no encontrada.</p>
        <Link href="/" className="text-xs text-blue-400 hover:underline">
          Volver a Mis Postulaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs text-blue-400 font-semibold">{app.companyName}</div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-words">
              {app.jobTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Estado:</span>
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(e.target.value as JobApplication["status"])}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="draft">Borrador</option>
              <option value="applied">Postulado</option>
              <option value="interviewing">En Entrevista</option>
              <option value="offer">Oferta</option>
              <option value="rejected">Descartado</option>
            </select>
          </div>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-rose-400 text-slate-400 transition-colors"
            title="Eliminar postulación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs (Desplazables en móvil) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-800 w-full max-w-full min-w-0">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 whitespace-nowrap ${
            activeTab === "analysis"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Informe de Calce ({app.analysis?.matchScore || 0}%)</span>
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

      {/* Tab Content */}
      {activeTab === "analysis" && app.analysis && (
        <MatchScoreCard analysis={app.analysis} />
      )}

      {activeTab === "resume" && (
        <div>
          {loadingResume ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="text-xs text-slate-400">Generando CV adaptado con IA...</p>
            </div>
          ) : app.tailoredResume ? (
            <ResumeViewer resume={app.tailoredResume} applicationId={app.id} />
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

      {activeTab === "outreach" && (
        <div>
          {loadingOutreach ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="text-xs text-slate-400">Generando cartas y mensajes de contacto...</p>
            </div>
          ) : app.outreachPitch ? (
            <OutreachViewer outreach={app.outreachPitch} />
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

      {activeTab === "interview" && (
        <MockInterview
          initialJobContext={`${app.jobTitle} en ${app.companyName}`}
          applicationId={app.id}
          initialMessages={app.interviewMessages}
        />
      )}
    </div>
  );
}
