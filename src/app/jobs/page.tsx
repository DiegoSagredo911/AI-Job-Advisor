"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/profile-context";
import { JobListing, JobSearchParams } from "@/types/job-search";
import {
  Search,
  MapPin,
  Calendar,
  Briefcase,
  Sparkles,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import axios from "axios";

export default function JobSearchPage() {
  const router = useRouter();
  const { activeProfile, activeSlug } = useProfile();

  // Search parameters state
  const [query, setQuery] = useState("Full Stack");
  const [country, setCountry] = useState("Chile");
  const [city, setCity] = useState("");
  const [days, setDays] = useState<number>(30);
  const [fromDate, setFromDate] = useState("");
  const [modality, setModality] = useState<JobSearchParams["modality"]>("all");

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [externalUrls, setExternalUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);

  // Initialize query from active profile skills/headline
  useEffect(() => {
    if (activeProfile?.headline) {
      if (activeProfile.headline.toLowerCase().includes("full stack")) {
        setQuery("Full Stack");
      } else if (activeProfile.headline.toLowerCase().includes("frontend")) {
        setQuery("Frontend React");
      } else if (activeProfile.headline.toLowerCase().includes(".net")) {
        setQuery(".NET Developer");
      }
    }
  }, [activeProfile]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const searchParams = new URLSearchParams();
      if (query) searchParams.set("query", query);
      if (country) searchParams.set("country", country);
      if (city) searchParams.set("city", city);
      if (days) searchParams.set("days", days.toString());
      if (fromDate) searchParams.set("fromDate", fromDate);
      if (modality) searchParams.set("modality", modality);

      const { data } = await axios.get(`/api/jobs/search?${searchParams.toString()}`);
      if (data.success && data.jobs) {
        setJobs(data.jobs);
        setExternalUrls(data.externalUrls || {});
      }
    } catch (err) {
      console.error("Error searching jobs with axios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleAnalyzeJob = (job: JobListing) => {
    setAnalyzingJobId(job.id);
    const fullText = `TITULO: ${job.title}
EMPRESA: ${job.company}
UBICACION: ${job.location}
FECHA PUBLICACION: ${job.publishedDate}
ENLACE: ${job.url}

DESCRIPCION Y REQUISITOS:
${job.description}

TECNOLOGIAS Y TAGS:
${job.tags.join(", ")}`;

    // Store in localStorage so /analyze picks it up immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("pendingJobDescription", fullText);
    }
    router.push("/analyze");
  };

  const calculateDaysAgo = (dateStr: string): string => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Hoy";
      if (diffDays === 1) return "Ayer";
      return `Hace ${diffDays} días`;
    } catch {
      return formatDate(dateStr);
    }
  };

  const sampleKeywords = [
    "Full Stack",
    "Ingeniería Industrial",
    "Ingeniería Eléctrica",
    "Ingeniería Mecánica",
    "Ingeniería Civil",
    "Gestión de Procesos / Lean",
    "SCADA / Potencia",
    "Next.js / React",
    "PostgreSQL",
    "Cloud AWS",
  ];

  const cityOptions = [
    { label: "Todas las ciudades", value: "" },
    { label: "Concepción (Biobío)", value: "Concepción" },
    { label: "Santiago (RM)", value: "Santiago" },
    { label: "Valparaíso", value: "Valparaíso" },
    { label: "Solo Remoto", value: "Remoto" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Search className="w-3.5 h-3.5" />
          <span>Buscador & Agregador de Vacantes Laborales</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Explorar Vacantes para {activeProfile?.fullName || "Tu Perfil"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Filtra ofertas de empleo por fecha de publicación reciente, ciudad, región y país, y
          evalúa con 1 clic cómo se adaptan a tu perfil con la IA.
        </p>
      </div>

      {/* Search and Filters Box */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main search bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cargo o tecnología (ej. Full Stack, Next.js, Node.js, .NET)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Buscar Ofertas</span>
            </button>
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 mr-1">Filtros rápidos:</span>
            {sampleKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(kw);
                }}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-colors ${
                  query === kw
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Detailed Filters: Country, City/Region, Date, Modality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            {/* Filter: País */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>País</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Chile">Chile</option>
                <option value="Remoto Internacional">Remoto Internacional / Latam</option>
                <option value="México">México</option>
                <option value="Colombia">Colombia</option>
                <option value="Argentina">Argentina</option>
                <option value="España">España</option>
                <option value="Estados Unidos">Estados Unidos (Remoto)</option>
                <option value="Todas">Cualquier País</option>
              </select>
            </div>

            {/* Filter: Ciudad / Región */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ciudad / Región</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Concepción, Santiago o libre..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter: Fecha de Publicación */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Fecha de Publicación</span>
              </label>
              <select
                value={days}
                onChange={(e) => {
                  setDays(parseInt(e.target.value, 10));
                  setFromDate("");
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="1">Últimas 24 horas (Hoy)</option>
                <option value="3">Últimos 3 días</option>
                <option value="7">Última semana (7 días)</option>
                <option value="14">Últimas 2 semanas (14 días)</option>
                <option value="30">Último mes (30 días)</option>
                <option value="60">Últimos 2 meses</option>
              </select>
            </div>

            {/* Filter: Modalidad */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Modalidad</span>
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as JobSearchParams["modality"])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas las modalidades</option>
                <option value="remote">100% Remoto</option>
                <option value="hybrid">Híbrido</option>
                <option value="presential">Presencial</option>
              </select>
            </div>
          </div>

          {/* Optional: Specific Date Picker */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
            <span>O filtrar desde fecha específica:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
            {fromDate && (
              <button
                type="button"
                onClick={() => setFromDate("")}
                className="text-xs text-rose-400 hover:underline"
              >
                Limpiar fecha
              </button>
            )}
          </div>
        </form>
      </div>

      {/* External Live Search Links Bar */}
      {externalUrls.linkedIn && (
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 font-medium">
            ¿Quieres explorar más vacantes en vivo con estos mismos filtros?
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={externalUrls.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 font-semibold transition-colors"
            >
              <span>Ver en LinkedIn Jobs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={externalUrls.getOnBrd}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 font-semibold transition-colors"
            >
              <span>Ver en Get on Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={externalUrls.googleJobs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-semibold transition-colors"
            >
              <span>Google Jobs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Job Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">
            {loading ? "Buscando..." : `${jobs.length} ofertas encontradas`}
          </span>
          <span>Ordenadas por fecha más reciente</span>
        </div>

        {loading ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-xs text-slate-400">
              Buscando vacantes publicadas en Chile y plataformas remotas...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-3">
            <Briefcase className="w-8 h-8 mx-auto text-slate-600" />
            <div className="text-sm font-semibold text-white">
              No se encontraron ofertas con estos filtros exactos
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Prueba ampliando el rango de fecha a 30 días, cambiando la ciudad a "Remoto" o
              utilizando los enlaces directos a LinkedIn Jobs arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-3xl">
                  {/* Company & Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-blue-400">{job.company}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{calculateDaysAgo(job.publishedDate)}</span>
                    </span>
                    {job.isRemote && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-semibold">
                        Remoto
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description.replace(/<[^>]*>?/gm, "")}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.tags.slice(0, 6).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions: Analyze with AI & Direct Link */}
                <div className="flex md:flex-col items-center md:items-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => handleAnalyzeJob(job)}
                    disabled={analyzingJobId === job.id}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25"
                  >
                    {analyzingJobId === job.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Abriendo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analizar con mi Perfil</span>
                      </>
                    )}
                  </button>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                  >
                    <span>Ver Publicación</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
