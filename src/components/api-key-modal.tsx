"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApiKey } from "@/context/api-key-context";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Trash2,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export function ApiKeyModal() {
  const {
    apiKey,
    model,
    fallbackModel,
    availableModels,
    isLoadingModels,
    refreshModels,
    hasKey,
    isTesting,
    isModalOpen,
    setIsModalOpen,
    saveApiKey,
    clearApiKey,
  } = useApiKey();

  const [inputKey, setInputKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(model);
  const [selectedFallbackModel, setSelectedFallbackModel] = useState(fallbackModel);
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      setInputKey(apiKey);
      setSelectedModel(model);
      setSelectedFallbackModel(fallbackModel);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isModalOpen, apiKey, model, fallbackModel]);

  if (!isModalOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await saveApiKey(inputKey, selectedModel, selectedFallbackModel);
    if (result.success) {
      setSuccessMsg("¡API Key y modelos configurados con éxito en tu navegador!");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1200);
    } else {
      setErrorMsg(result.error || "No se pudo validar la API Key con Google Gemini.");
    }
  };

  const handleClear = () => {
    if (confirm("¿Estás seguro de que deseas eliminar tu API Key guardada de este navegador?")) {
      clearApiKey();
      setInputKey("");
      setSuccessMsg("API Key eliminada correctamente de tu navegador.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Gemini API Key
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% Gratis
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tu clave personal de Google AI para analizar vacantes y generar CVs
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
          {/* Status banner */}
          {hasKey ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-300">API Key activa en tu navegador</p>
                <p className="text-emerald-400/80">
                  Tu sesión está lista para procesar vacantes, adaptar tu CV a formato Harvard y simular entrevistas.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">Configuración requerida</p>
                <p className="text-amber-400/80">
                  Ingresa tu clave de Google Gemini para habilitar el motor de Inteligencia Artificial. Se guardará únicamente en tu navegador.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Ingresa tu Gemini API Key:
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-11 text-white text-sm focus:outline-none focus:border-blue-500 font-mono tracking-wide placeholder:font-sans placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title={showKey ? "Ocultar" : "Mostrar"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Dual Model Selection: Preferred & Fallback */}
            <div className="space-y-3 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Configuración de Modelos & Fallback
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const keyToQuery = inputKey.trim() || apiKey;
                    if (!keyToQuery) {
                      setErrorMsg("Ingresa una API Key para consultar los modelos disponibles en tu cuenta.");
                      return;
                    }
                    setErrorMsg(null);
                    try {
                      await refreshModels(keyToQuery);
                      setSuccessMsg("¡Listado de modelos actualizado dinámicamente desde la API de Gemini!");
                    } catch (e: unknown) {
                      const msg = e instanceof Error ? e.message : String(e);
                      setErrorMsg("No se pudieron cargar modelos: " + msg);
                    }
                  }}
                  disabled={isLoadingModels || (!inputKey.trim() && !apiKey)}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 disabled:opacity-40 transition-colors"
                  title="Consultar la API de Gemini para actualizar modelos disponibles"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingModels ? "animate-spin text-blue-400" : ""}`} />
                  <span>{isLoadingModels ? "Consultando API..." : "Actualizar catálogo"}</span>
                </button>
              </div>

              {/* 1. Preferred Model */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>1. Modelo Principal / Preferido:</span>
                  <span className="text-[10px] text-blue-400 font-normal">Prioridad 1</span>
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isLoadingModels}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Fallback Model */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>2. Modelo de Respaldo / Fallback:</span>
                  <span className="text-[10px] text-amber-400 font-normal">Auto-conmutación (429 / Cuota)</span>
                </label>
                <select
                  value={selectedFallbackModel}
                  onChange={(e) => setSelectedFallbackModel(e.target.value)}
                  disabled={isLoadingModels}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-60"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                  ⚡ Si <strong className="text-slate-200">{selectedModel}</strong> alcanza el límite de cuota por minuto (<code className="text-amber-400">429 Too Many Requests</code>) o saturación, el sistema rotará en milisegundos a <strong className="text-slate-200">{selectedFallbackModel}</strong> de forma transparente.
                </p>
              </div>
            </div>

            {/* Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {hasKey ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 border border-red-900/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar Clave
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isTesting || !inputKey.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validando clave...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Validar y Guardar
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Guide section */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">
              ¿Cómo obtener tu API Key gratuita en 1 minuto?
            </h4>
            <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1">
              <li>Inicia sesión con tu cuenta de Google en Google AI Studio.</li>
              <li>Haz clic en el botón azul <strong>&quot;Get API key&quot;</strong> o <strong>&quot;Create API key&quot;</strong>.</li>
              <li>Copia la clave generada y pégala aquí arriba.</li>
            </ol>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium pt-1 underline"
            >
              Abrir Google AI Studio (Gratis)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Privacy & Security guarantee */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>100% Privado y Local:</strong> Tu clave se guarda exclusivamente en el almacenamiento local (<code className="text-slate-300 font-mono text-[10px]">localStorage</code>) de tu navegador. Consulta los{" "}
              <Link
                href="/terms"
                onClick={() => setIsModalOpen(false)}
                className="text-blue-400 hover:underline font-semibold"
              >
                Términos y Condiciones
              </Link>{" "}
              de uso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
