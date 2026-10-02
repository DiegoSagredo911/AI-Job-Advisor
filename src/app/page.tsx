"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/context/profile-context";
import { JobApplication } from "@/types/advisor";
import {
  Briefcase,
  FileSearch,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trash2,
  TrendingUp,
  FolderOpen,
  UserPlus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { QuickSetupModal } from "@/components/quick-setup-modal";
import axios from "axios";

export default function DashboardPage() {
  const { activeSlug, activeProfile } = useProfile();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/applications?profile=${activeSlug}`);
      if (data.success && data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Error fetching applications with axios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeSlug]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta postulación?")) return;
    try {
      const { data } = await axios.delete(`/api/applications/${id}`);
      if (data.success) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error deleting application with axios:", err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: JobApplication["status"], e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    try {
      const app = applications.find((a) => a.id === id);
      if (!app) return;
      const updated = { ...app, status: newStatus };
      await axios.put(`/api/applications/${id}`, updated);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error("Error updating status with axios:", err);
    }
  };

  const filtered = applications.filter((app) =>
    filterStatus === "all" ? true : app.status === filterStatus
  );

  const stats = {
    total: applications.length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offers: applications.filter((a) => a.status === "offer").length,
    avgScore: applications.length
      ? Math.round(
          applications.reduce((acc, curr) => acc + (curr.analysis?.matchScore || 0), 0) /
            applications.length
        )
      : 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asesor de Carrera & Postulaciones con IA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hola, {activeProfile?.fullName || "Bienvenido/a"}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Tu perfil profesional está sincronizado con tu CV, portafolio y trayectoria.
            Pega cualquier oferta de trabajo para analizar tu compatibilidad técnica, generar un CV
            optimizado para ATS y entrenar para la entrevista técnica.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsSetupOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/25"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cargar Mi Perfil (Subir Mi CV)</span>
            </button>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-600/30"
            >
              <FileSearch className="w-4 h-4" />
              <span>Analizar Nueva Vacante</span>
            </Link>
            <Link
              href="/profiles"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-slate-400" />
              <span>Gestionar Documentos & URLs</span>
            </Link>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Perfil activo: <strong className="text-white">{activeProfile?.fullName || "Mi Perfil"}</strong>.
              Puedes cargar tu propio CV y enlaces para tener tu asesor listo a tu medida.
            </span>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Postulaciones Activas</div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-xs text-slate-400 font-medium">En Entrevistas</div>
          <div className="text-2xl font-black text-indigo-400">{stats.interviewing}</div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Ofertas Recibidas</div>
          <div className="text-2xl font-black text-emerald-400">{stats.offers}</div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Calce Técnico Promedio</div>
          <div className="text-2xl font-black text-blue-400">{stats.avgScore}%</div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Historial de Postulaciones</span>
            </h2>
            <p className="text-xs text-slate-400">
              Perfil: <span className="text-slate-200 font-medium">{activeProfile?.fullName || "Mi Perfil"}</span>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {["all", "draft", "applied", "interviewing", "offer"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {status === "all"
                  ? "Todas"
                  : status === "draft"
                  ? "Borradores"
                  : status === "applied"
                  ? "Postuladas"
                  : status === "interviewing"
                  ? "Entrevistas"
                  : "Ofertas"}
              </button>
            ))}
          </div>
        </div>

        {/* List of Applications */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Cargando postulaciones...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white">
              No hay postulaciones registradas en este estado
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Pega una oferta de empleo para comenzar a recibir asesoría personalizada sobre cómo
              postular.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              <span>Analizar mi primera vacante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((app) => {
              const score = app.analysis?.matchScore || 0;
              return (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-blue-400 font-semibold">
                          {app.companyName || "Empresa"}
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {app.jobTitle}
                        </h3>
                      </div>

                      {score > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 font-extrabold text-xs shrink-0">
                          {score}% Calce
                        </div>
                      )}
                    </div>

                    {app.analysis?.fitSummary && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {app.analysis.fitSummary}
                      </p>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value as JobApplication["status"], e)
                        }
                        className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                      >
                        <option value="draft">Borrador</option>
                        <option value="applied">Postulado</option>
                        <option value="interviewing">En Entrevista</option>
                        <option value="offer">Oferta</option>
                        <option value="rejected">Descartado</option>
                      </select>
                      <span className="text-[10px] text-slate-500">
                        {formatDate(app.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(app.id, e)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar postulación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Configuración Rápida para cualquier persona */}
      <QuickSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />
    </div>
  );
}
