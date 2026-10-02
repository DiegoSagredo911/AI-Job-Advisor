"use client";

import React, { useState, useEffect } from "react";
import { useProfile } from "@/context/profile-context";
import { ProfileUrl } from "@/types/profile";
import {
  User,
  FolderOpen,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code2,
  Briefcase,
  GraduationCap,
  Globe,
  Download,
  RotateCcw,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import axios from "axios";

export default function ProfilesPage() {
  const {
    activeSlug,
    activeProfile,
    refreshProfiles,
    reloadActiveProfile,
  } = useProfile();

  const [documents, setDocuments] = useState<{ name: string; size: number; modifiedAt: string }[]>([]);
  const [urls, setUrls] = useState<ProfileUrl[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // New URL state
  const [newUrlLabel, setNewUrlLabel] = useState("");
  const [newUrlValue, setNewUrlValue] = useState("");


  // Generic Word CV Download state
  const [downloadingDocx, setDownloadingDocx] = useState<"harvard" | "ats" | null>(null);

  const handleDownloadGenericDocx = async (format: "harvard" | "ats") => {
    if (!activeSlug || downloadingDocx) return;
    setDownloadingDocx(format);

    try {
      const response = await axios.post(
        "/api/export/docx",
        {
          profileSlug: activeSlug,
          format,
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
      a.download = `CV_${format.toUpperCase()}_Generico_${safeName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading generic docx with axios:", err);
      alert("Error al descargar el archivo Word editable.");
    } finally {
      setDownloadingDocx(null);
    }
  };

  // Reset Profile Context state
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const fetchProfileDetails = async () => {
    setLoadingDocs(true);
    try {
      const { data } = await axios.get(`/api/profiles/${activeSlug}`);
      if (data.success) {
        setDocuments(data.documents || []);
        setUrls(data.urls || []);
      }
    } catch (err) {
      console.error("Error loading profile details with axios:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleResetProfile = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const { data } = await axios.post(`/api/profiles/${activeSlug}/reset`);
      if (data.success) {
        setDocuments([]);
        setUrls([]);
        setResetNotice("¡Perfil reiniciado exitosamente! Se han eliminado todas las referencias, documentos, enlaces y postulaciones previas. Sube tu nuevo CV o notas para configurar tu asesor.");
        setShowResetModal(false);
        await reloadActiveProfile();
        await refreshProfiles();
        setTimeout(() => setResetNotice(null), 8000);
      } else {
        alert(data.error || "No se pudo reiniciar el perfil.");
      }
    } catch (err) {
      console.error("Error resetting profile with axios:", err);
      alert("Error de conexión al reiniciar el perfil.");
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [activeSlug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const { data } = await axios.post(`/api/profiles/${activeSlug}/documents`, formData);
      if (data.success) {
        alert(data.message || "Archivos subidos con éxito");
        fetchProfileDetails();
        refreshProfiles();
      } else {
        alert(data.error || "Error al subir archivos");
      }
    } catch (err) {
      console.error("Error uploading documents with axios:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrlLabel.trim() || !newUrlValue.trim()) return;

    const updated = [
      ...urls,
      { label: newUrlLabel.trim(), url: newUrlValue.trim() },
    ];

    try {
      if (activeProfile) {
        const fullUpdated = { ...activeProfile, urls: updated };
        await axios.put(`/api/profiles/${activeSlug}`, fullUpdated);
      }
      setUrls(updated);
      setNewUrlLabel("");
      setNewUrlValue("");
      reloadActiveProfile();
    } catch (err) {
      console.error("Error adding URL with axios:", err);
    }
  };

  const handleIngestWithAI = async () => {
    if (isIngesting) return;
    setIsIngesting(true);
    setIngestStatus("Leyendo documentos de la carpeta y URLs con IA...");

    try {
      const { data } = await axios.post(`/api/profiles/${activeSlug}/ingest`);
      if (data.success) {
        setIngestStatus("¡Perfil maestro consolidado exitosamente!");
        await reloadActiveProfile();
        await refreshProfiles();
        setTimeout(() => setIngestStatus(null), 4000);
      } else {
        setIngestStatus(data.error || "No se pudo consolidar el perfil");
      }
    } catch (err) {
      console.error("Error ingesting profile with axios:", err);
      setIngestStatus("Error de conexión al procesar con IA");
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-7 h-7 text-blue-500" />
            <span>Mi Perfil, Documentos & URLs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Administra tu información profesional, CVs en PDF y enlaces públicos para que tu asesor de IA trabaje a tu medida.
          </p>
        </div>

        {/* Action Button: Resetear Perfil */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            title="Reiniciar tu perfil y hacer que la IA olvide todo el contexto para empezar de cero"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Resetear Perfil</span>
          </button>
        </div>
      </div>

      {/* Reset Notification Banner */}
      {resetNotice && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium leading-relaxed">{resetNotice}</span>
          </div>
          <button
            onClick={() => setResetNotice(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Profile Master View & Ingestion Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Documents & URLs Ingestion (2 cols) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 w-full max-w-full min-w-0 overflow-hidden">
          {/* Section 1: Documents Folder Ingestion */}
          <div className="p-4 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Documentos de Experiencia (CV, Certificados)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Formatos admitidos: PDF, Word (.docx), Markdown (.md) o texto plano (.txt)
                </p>
              </div>

              {/* Upload Input */}
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "Subiendo..." : "Subir Archivo"}</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Document list */}
            {loadingDocs ? (
              <div className="py-6 text-center text-xs text-slate-500">Cargando archivos...</div>
            ) : documents.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Aún no has subido documentos en tu perfil.
                </p>
                <p className="text-[11px] text-slate-500">
                  Sube tu CV en PDF, cartas de recomendación o notas de proyectos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{doc.name}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {(doc.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: URLs of the person */}
          <div className="p-4 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 sm:space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>URLs & Enlaces Públicos</span>
              </h2>
              <p className="text-xs text-slate-400">
                LinkedIn, portafolio personal, GitHub y enlaces a proyectos en producción.
              </p>
            </div>

            {/* URL list */}
            <div className="space-y-2">
              {urls.map((u, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 overflow-hidden">
                    <div className="font-semibold text-slate-200 truncate">{u.label}</div>
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 min-w-0 truncate text-[11px]"
                    >
                      <span className="truncate">{u.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  {u.description && (
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      {u.description}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Add new URL Form */}
            <form onSubmit={handleAddUrl} className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nombre (ej. Blog, Repositorio)"
                value={newUrlLabel}
                onChange={(e) => setNewUrlLabel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 sm:w-44"
              />
              <input
                type="url"
                placeholder="https://..."
                value={newUrlValue}
                onChange={(e) => setNewUrlValue(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 flex-1"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar URL</span>
              </button>
            </form>
          </div>

          {/* Section 3: AI Consolidate Profile Button */}
          <div className="p-6 rounded-2xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/30 to-blue-950/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Consolidar Perfil Maestro con IA</span>
                </div>
                <p className="text-xs text-slate-300">
                  Gemini leerá todos los documentos de la carpeta y las URLs configuradas para
                  actualizar automáticamente las habilidades, experiencia laboral y proyectos
                  estructurados.
                </p>
              </div>

              <button
                onClick={handleIngestWithAI}
                disabled={isIngesting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-lg shadow-indigo-600/30"
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Consolidando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ejecutar Ingesta con IA</span>
                  </>
                )}
              </button>
            </div>

            {ingestStatus && (
              <div className="p-3 rounded-lg bg-slate-900 border border-indigo-900 text-xs text-indigo-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{ingestStatus}</span>
              </div>
            )}
          </div>

          {/* Section 4: Reset & Clear AI Context (Empezar de Cero) */}
          <div className="p-6 rounded-2xl border border-rose-900/40 bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-slate-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Zona de Reinicio: Empezar de Cero</span>
                </div>
                <p className="text-xs text-slate-400">
                  Si deseas que la IA olvide todo y reiniciar la base de conocimiento de este perfil,
                  este botón elimina los documentos subidos de la carpeta, los enlaces y la memoria en caché.
                  La IA perderá el contexto previo para que puedas subir nuevos archivos y links desde cero.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl border border-rose-500/50 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-950/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reiniciar Perfil (Reset Completo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Profile Overview & New Candidate Creator */}
        <div className="space-y-8">
          {/* Active Profile Summary Card */}
          <div className="p-4 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 w-full max-w-full min-w-0 overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Tu Perfil Profesional
              </span>
              <h3 className="text-xl font-bold text-white">
                {activeProfile?.fullName || "Tu Nombre"}
              </h3>
              <p className="text-xs text-slate-400 break-words">{activeProfile?.headline}</p>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3 break-words">
              {activeProfile?.about}
            </div>

            {/* Quick Skills Pills */}
            {activeProfile?.skills && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400">
                  Habilidades Principales:
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    ...(activeProfile.skills.frameworks || []).slice(0, 4),
                    ...(activeProfile.skills.languages || []).slice(0, 3),
                    ...(activeProfile.skills.databases || []).slice(0, 2),
                    ...(activeProfile.skills.hardwareRealtime || []).slice(0, 1),
                  ].map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Experience Count */}
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Empresas / Experiencias:</span>
              <span className="text-white font-bold">{activeProfile?.experience?.length || 0}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Proyectos Destacados:</span>
              <span className="text-white font-bold">{activeProfile?.projects?.length || 0}</span>
            </div>

            {/* Generic CV Word Export Box */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Descargar CV Genérico en Word (.docx editable)</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Genera tu currículum base estructurado y listo para abrir en Word y retocar libremente:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadGenericDocx("harvard")}
                  disabled={downloadingDocx !== null}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {downloadingDocx === "harvard" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>Formato Harvard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadGenericDocx("ats")}
                  disabled={downloadingDocx !== null}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {downloadingDocx === "ats" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>Formato ATS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Profile */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl border border-rose-900/60 bg-slate-950 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  ¿Reiniciar perfil y borrar contexto de la IA?
                </h3>
                <p className="text-xs text-slate-400">
                  Perfil actual: <strong className="text-slate-200">{activeProfile?.fullName || "Mi Perfil"}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-rose-400">Esta acción provocará lo siguiente:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Se eliminarán todos los documentos y archivos subidos (PDF, Word, etc.)</li>
                <li>Se limpiará la lista de enlaces y URLs guardadas</li>
                <li>Se borrarán todos los datos personales (nombre, correo, teléfono, bio)</li>
                <li>Se vaciará toda la experiencia, proyectos, habilidades y educación</li>
                <li>Se eliminarán las postulaciones y análisis de vacantes previos del historial</li>
                <li>La IA perderá el 100% de las referencias para empezar totalmente de cero</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetProfile}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-950"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Reiniciando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Reiniciar Todo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
