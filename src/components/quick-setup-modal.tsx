"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useProfile } from "@/context/profile-context";
import {
  UserPlus,
  Upload,
  Globe,
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";
import axios from "axios";

interface QuickSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSetupModal({ isOpen, onClose }: QuickSetupModalProps) {
  const { setActiveSlug, refreshProfiles } = useProfile();
  const [mounted, setMounted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setProgressMsg("1/3 Guardando documentos y enlaces...");

    const formData = new FormData();
    formData.append("fullName", fullName.trim());
    formData.append("headline", headline.trim() || "Profesional");
    if (linkedinUrl) formData.append("linkedinUrl", linkedinUrl.trim());
    if (portfolioUrl) formData.append("portfolioUrl", portfolioUrl.trim());
    if (githubUrl) formData.append("githubUrl", githubUrl.trim());
    if (pastedText) formData.append("pastedText", pastedText.trim());

    for (const file of selectedFiles) {
      formData.append("cvFiles", file);
    }

    try {
      setProgressMsg("2/3 Extrayendo experiencia y habilidades con Gemini Flash...");

      const { data } = await axios.post("/api/profiles/quick-setup", formData);

      if (data.success && data.profile) {
        setProgressMsg("3/3 ¡Perfil consolidado exitosamente!");
        await refreshProfiles();
        setActiveSlug(data.profile.slug);

        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 1200);
      } else {
        alert(data.error || "Ocurrió un error al configurar el perfil");
        setIsSubmitting(false);
        setProgressMsg(null);
      }
    } catch (err) {
      console.error("Error setting up profile with axios:", err);
      alert("Error de conexión al procesar el perfil.");
      setIsSubmitting(false);
      setProgressMsg(null);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 font-sans space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Configuración Rápida para Nuevo Usuario</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Cargar Mi Perfil de Postulaciones
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sube tu CV en PDF o notas de experiencia y agrega tus enlaces. La IA extraerá tu perfil
            técnico en segundos y activará tu propio asesor.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Título o Especialidad
              </label>
              <input
                type="text"
                placeholder="Ej. Arqueólogo/a, Antropólogo/a, Ing. Civil, Full Stack, Diseñador/a"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Subir Archivo de CV (PDF, Word o TXT)
            </label>
            <div className="border border-dashed border-slate-700 rounded-2xl p-4 bg-slate-950/60 text-center hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                id="modalCvInput"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="modalCvInput"
                className="cursor-pointer flex flex-col items-center gap-1.5"
              >
                <Upload className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-medium text-slate-200">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} archivo(s) seleccionado(s): ${selectedFiles.map((f) => f.name).join(", ")}`
                    : "Haz clic para seleccionar tu CV en PDF"}
                </span>
                <span className="text-[10px] text-slate-500">
                  Soporta PDF, Word (.docx), Markdown o texto plano
                </span>
              </label>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Tus Enlaces Públicos (Opcional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <input
                type="url"
                placeholder="Portafolio / Web"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Or Paste Text directly */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              O pega texto libre de tu experiencia (Opcional si no tienes PDF a mano)
            </label>
            <textarea
              rows={3}
              placeholder="Pega aquí extractos de tu CV, resumen o notas de tus proyectos..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Progress Banner */}
          {progressMsg && (
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-xs text-blue-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>{progressMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!fullName.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Mi Perfil con IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
