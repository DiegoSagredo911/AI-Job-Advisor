import { CandidateProfile, ProfileMetadata, ProfileDocument } from "@/types/profile";
import { JobApplication } from "@/types/advisor";

export const PROFILES_STORAGE_KEY = "ai_job_advisor_profiles_data";
export const APPLICATIONS_STORAGE_KEY = "ai_job_advisor_applications_data";
export const ACTIVE_SLUG_KEY = "activeProfileSlug";

export const DEFAULT_INITIAL_PROFILE: CandidateProfile = {
  slug: "mi-perfil",
  fullName: "Mi Perfil Profesional",
  headline: "Desarrollador / Profesional TI",
  email: "usuario@ejemplo.com",
  phone: "+56 9 1234 5678",
  location: "Chile (Remoto / Híbrido)",
  about: "Profesional enfocado en desarrollo de software, análisis metodológico y entrega de soluciones de alto impacto.",
  urls: [
    { label: "LinkedIn", url: "https://linkedin.com", description: "Perfil profesional" },
    { label: "GitHub", url: "https://github.com", description: "Repositorio de proyectos" },
  ],
  documents: [],
  skills: {
    languages: ["TypeScript", "JavaScript", "Python"],
    frameworks: ["React", "Next.js", "Node.js", "Tailwind CSS"],
    databases: ["PostgreSQL", "MongoDB", "SQL Server"],
    cloudDevOps: ["AWS", "Docker", "Git", "CI/CD"],
    toolsMethods: ["Scrum", "Arquitectura Limpia", "REST APIs"],
    hardwareRealtime: [],
  },
  experience: [
    {
      id: "exp-1",
      company: "Empresa Tecnológica",
      role: "Desarrollador Full Stack / Especialista TI",
      period: "2023 - Presente",
      location: "Remoto",
      highlights: [
        "Desarrollo e integración de interfaces web y APIs escalables.",
        "Optimización de rendimiento y buenas prácticas de Clean Code.",
      ],
      technologies: ["React", "Next.js", "TypeScript", "Node.js"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "AI Job Advisor",
      role: "Creador & Desarrollador Principal",
      description: "Plataforma de asesoría laboral inteligente con IA para análisis de vacantes y preparación de entrevistas.",
      architectureHighlights: ["Almacenamiento 100% en navegador del usuario", "Integración con Gemini"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Gemini API"],
    },
  ],
  education: [
    {
      degree: "Ingeniería / Licenciatura Profesional",
      institution: "Universidad",
      period: "2019 - 2023",
    },
  ],
  certifications: [
    {
      name: "Especialización Profesional & Cloud",
      issuer: "Plataforma de Certificación",
      year: "2024",
    },
  ],
  preferences: {
    targetRoles: ["Full Stack Developer", "Backend Engineer", "Frontend Developer"],
    workModality: "Remoto o Híbrido",
    salaryExpectation: "A convenir",
  },
  updatedAt: new Date().toISOString(),
};

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// ---------------- INICIALIZACIÓN Y MIGRACIÓN ----------------

export function initLocalStorageIfEmpty(): void {
  if (typeof window === "undefined") return;

  const existingProfiles = safeGetItem<CandidateProfile[]>(PROFILES_STORAGE_KEY, []);
  if (existingProfiles.length === 0) {
    safeSetItem(PROFILES_STORAGE_KEY, [DEFAULT_INITIAL_PROFILE]);
  }

  const existingApps = safeGetItem<JobApplication[]>(APPLICATIONS_STORAGE_KEY, []);
  if (!existingApps || !Array.isArray(existingApps)) {
    safeSetItem(APPLICATIONS_STORAGE_KEY, []);
  }
}

// ---------------- PERFILES ----------------

export function getAllProfiles(): CandidateProfile[] {
  const profiles = safeGetItem<CandidateProfile[]>(PROFILES_STORAGE_KEY, []);
  if (profiles.length === 0) {
    safeSetItem(PROFILES_STORAGE_KEY, [DEFAULT_INITIAL_PROFILE]);
    return [DEFAULT_INITIAL_PROFILE];
  }
  return profiles;
}

export function getProfilesMetadata(): ProfileMetadata[] {
  const profiles = getAllProfiles();
  return profiles.map((p) => ({
    slug: p.slug,
    fullName: p.fullName || p.slug,
    headline: p.headline || "Perfil Profesional",
    email: p.email || "",
    documentCount: p.documents?.length || (p.rawDocumentsSummary ? 1 : 0),
    urlCount: p.urls?.length || 0,
    updatedAt: p.updatedAt || new Date().toISOString(),
  }));
}

export function getProfileBySlug(slug: string): CandidateProfile | null {
  const profiles = getAllProfiles();
  return profiles.find((p) => p.slug === slug) || profiles[0] || null;
}

export function saveProfile(profile: CandidateProfile): CandidateProfile {
  const profiles = getAllProfiles();
  const index = profiles.findIndex((p) => p.slug === profile.slug);
  const updated = {
    ...profile,
    documents: profile.documents || [],
    urls: profile.urls || [],
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    profiles[index] = updated;
  } else {
    profiles.push(updated);
  }

  safeSetItem(PROFILES_STORAGE_KEY, profiles);
  return updated;
}

export function deleteProfile(slug: string): boolean {
  let profiles = getAllProfiles();
  if (profiles.length <= 1) {
    return false;
  }
  profiles = profiles.filter((p) => p.slug !== slug);
  safeSetItem(PROFILES_STORAGE_KEY, profiles);
  clearApplicationsByProfile(slug);
  return true;
}

export function resetProfileData(slug: string): CandidateProfile {
  const resetProfile: CandidateProfile = {
    slug,
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    about: "",
    urls: [],
    documents: [],
    skills: {
      languages: [],
      frameworks: [],
      databases: [],
      cloudDevOps: [],
      toolsMethods: [],
      hardwareRealtime: [],
      technicalCompetencies: [],
      softwareTools: [],
      standardsRegulations: [],
      managementOperations: [],
    },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    preferences: {
      targetRoles: [],
      workModality: "",
      salaryExpectation: "",
    },
    rawDocumentsSummary: "",
    updatedAt: new Date().toISOString(),
  };

  saveProfile(resetProfile);
  clearApplicationsByProfile(slug);
  return resetProfile;
}

export function addProfileDocument(slug: string, doc: ProfileDocument): CandidateProfile | null {
  const profile = getProfileBySlug(slug);
  if (!profile) return null;

  const currentDocs = profile.documents || [];
  const existingIdx = currentDocs.findIndex((d) => d.name === doc.name);
  if (existingIdx >= 0) {
    currentDocs[existingIdx] = doc;
  } else {
    currentDocs.push(doc);
  }
  profile.documents = currentDocs;
  return saveProfile(profile);
}

export function removeProfileDocument(slug: string, docName: string): CandidateProfile | null {
  const profile = getProfileBySlug(slug);
  if (!profile) return null;

  profile.documents = (profile.documents || []).filter((d) => d.name !== docName);
  return saveProfile(profile);
}

// ---------------- POSTULACIONES (APPLICATIONS) ----------------

export function getAllApplications(profileSlug?: string): JobApplication[] {
  const apps = safeGetItem<JobApplication[]>(APPLICATIONS_STORAGE_KEY, []);
  if (!profileSlug || profileSlug === "all") {
    return apps;
  }
  return apps.filter((a) => a.profileSlug === profileSlug);
}

export function getApplicationById(id: string): JobApplication | null {
  const apps = safeGetItem<JobApplication[]>(APPLICATIONS_STORAGE_KEY, []);
  return apps.find((a) => a.id === id) || null;
}

export function saveApplication(app: JobApplication): JobApplication {
  const apps = safeGetItem<JobApplication[]>(APPLICATIONS_STORAGE_KEY, []);
  const index = apps.findIndex((a) => a.id === app.id);
  const updated = {
    ...app,
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    apps[index] = updated;
  } else {
    apps.unshift(updated);
  }

  safeSetItem(APPLICATIONS_STORAGE_KEY, apps);
  return updated;
}

export function deleteApplication(id: string): boolean {
  const apps = safeGetItem<JobApplication[]>(APPLICATIONS_STORAGE_KEY, []);
  const filtered = apps.filter((a) => a.id !== id);
  if (filtered.length !== apps.length) {
    safeSetItem(APPLICATIONS_STORAGE_KEY, filtered);
    return true;
  }
  return false;
}

export function clearApplicationsByProfile(profileSlug?: string): void {
  if (!profileSlug) {
    safeSetItem(APPLICATIONS_STORAGE_KEY, []);
    return;
  }
  const apps = safeGetItem<JobApplication[]>(APPLICATIONS_STORAGE_KEY, []);
  const filtered = apps.filter((a) => a.profileSlug !== profileSlug);
  safeSetItem(APPLICATIONS_STORAGE_KEY, filtered);
}

// ---------------- EXPORTAR / IMPORTAR COPIA DE SEGURIDAD ----------------

export function exportAllDataAsJson(): string {
  const profiles = getAllProfiles();
  const applications = getAllApplications();
  const activeSlug = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_SLUG_KEY) || "mi-perfil" : "mi-perfil";

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    activeSlug,
    profiles,
    applications,
  };

  return JSON.stringify(data, null, 2);
}

export function importDataFromJson(jsonStr: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || (!data.profiles && !data.applications)) {
      return { success: false, error: "El archivo no contiene un formato válido de respaldo." };
    }

    if (Array.isArray(data.profiles) && data.profiles.length > 0) {
      safeSetItem(PROFILES_STORAGE_KEY, data.profiles);
    }
    if (Array.isArray(data.applications)) {
      safeSetItem(APPLICATIONS_STORAGE_KEY, data.applications);
    }
    if (data.activeSlug) {
      if (typeof window !== "undefined") {
        localStorage.setItem(ACTIVE_SLUG_KEY, data.activeSlug);
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Error al analizar el archivo JSON: " + (err as Error).message };
  }
}
