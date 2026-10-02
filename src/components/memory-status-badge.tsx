"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProfile } from "@/context/profile-context";
import { MemoryState } from "@/types/profile";
import { Cpu, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function MemoryStatusBadge() {
  const { activeSlug, reloadActiveProfile } = useProfile();
  const [memory, setMemory] = useState<MemoryState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchMemory = async () => {
    try {
      const { data } = await axios.get(`/api/profiles/${activeSlug}/memory`);
      if (data.success && data.memory) {
        setMemory(data.memory);
      }
    } catch (err) {
      console.error("Error fetching memory state with axios:", err);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, [activeSlug]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data } = await axios.post(`/api/profiles/${activeSlug}/memory`, { force: true });
      if (data.success) {
        setMemory(data.memory);
        await reloadActiveProfile();
      }
    } catch (err) {
      console.error("Error syncing memory with axios:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!memory) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {memory.isUpToDate ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Memoria Persistente Sincronizada</span>
          <span className="text-[10px] text-emerald-500 font-mono hidden sm:inline">
            (0 tokens extra)
          </span>
        </div>
      ) : (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60 text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          {isSyncing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {isSyncing
              ? "Actualizando Memoria..."
              : `Cambios detectados (${memory.changesDetected.modifiedDocuments.length || 0} archivos / URLs). Clic para sincronizar`}
          </span>
        </button>
      )}

      <button
        onClick={handleSync}
        disabled={isSyncing}
        title="Forzar actualización de memoria y caché"
        className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
