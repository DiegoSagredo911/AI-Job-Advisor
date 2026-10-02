import fs from "fs/promises";
import path from "path";
import { CandidateProfile, ProfileMetadata, ProfileUrl } from "@/types/profile";
import { clearApplicationsByProfile } from "@/lib/applications";

const PROFILES_DIR = path.join(process.cwd(), "data", "profiles");

export async function ensureProfilesDir(): Promise<void> {
  try {
    await fs.mkdir(PROFILES_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating profiles directory", err);
  }
}

export async function getProfilesList(): Promise<ProfileMetadata[]> {
  await ensureProfilesDir();
  try {
    const entries = await fs.readdir(PROFILES_DIR, { withFileTypes: true });
    const profileDirs = entries.filter(
      (e) => e.isDirectory() && !e.name.startsWith(".") && !e.name.startsWith("_")
    );

    const profiles: ProfileMetadata[] = [];

    for (const dir of profileDirs) {
      const slug = dir.name;
      const profilePath = path.join(PROFILES_DIR, slug, "profile.json");
      const docsDir = path.join(PROFILES_DIR, slug, "documents");
      const urlsPath = path.join(PROFILES_DIR, slug, "urls.json");

      let docCount = 0;
      try {
        const docFiles = await fs.readdir(docsDir);
        docCount = docFiles.filter((f) => !f.startsWith(".")).length;
      } catch {
        docCount = 0;
      }

      let urlCount = 0;
      try {
        const urlsRaw = await fs.readFile(urlsPath, "utf-8");
        const parsed = JSON.parse(urlsRaw);
        urlCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        urlCount = 0;
      }

      try {
        const raw = await fs.readFile(profilePath, "utf-8");
        const data = JSON.parse(raw) as CandidateProfile;
        profiles.push({
          slug,
          fullName: data.fullName || slug,
          headline: data.headline || "Perfil Profesional",
          email: data.email || "",
          documentCount: docCount,
          urlCount,
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      } catch {
        // If profile.json doesn't exist yet, provide basic metadata
        profiles.push({
          slug,
          fullName: slug.replace(/-/g, " "),
          headline: "Perfil en configuración",
          email: "",
          documentCount: docCount,
          urlCount,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return profiles;
  } catch (error) {
    console.error("Error listing profiles:", error);
    return [];
  }
}

export async function getProfileBySlug(slug: string): Promise<CandidateProfile | null> {
  await ensureProfilesDir();
  const profilePath = path.join(PROFILES_DIR, slug, "profile.json");

  try {
    const raw = await fs.readFile(profilePath, "utf-8");
    const profile = JSON.parse(raw) as CandidateProfile;
    return profile;
  } catch (error) {
    console.warn(`Profile ${slug} not found or invalid:`, error);
    return null;
  }
}

export async function saveProfile(profile: CandidateProfile): Promise<void> {
  await ensureProfilesDir();
  const profileDir = path.join(PROFILES_DIR, profile.slug);
  const docsDir = path.join(profileDir, "documents");
  await fs.mkdir(profileDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });

  profile.updatedAt = new Date().toISOString();
  const profilePath = path.join(profileDir, "profile.json");
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), "utf-8");

  if (profile.urls && profile.urls.length > 0) {
    const urlsPath = path.join(profileDir, "urls.json");
    await fs.writeFile(urlsPath, JSON.stringify(profile.urls, null, 2), "utf-8");
  }
}

export async function createProfile(slug: string, fullName: string, headline?: string): Promise<CandidateProfile> {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");
  const existing = await getProfileBySlug(cleanSlug);
  if (existing) {
    return existing;
  }

  const newProfile: CandidateProfile = {
    slug: cleanSlug,
    fullName,
    headline: headline || "Desarrollador / Profesional TI",
    email: "",
    phone: "",
    location: "",
    about: "",
    urls: [],
    skills: {
      languages: [],
      frameworks: [],
      databases: [],
      cloudDevOps: [],
      toolsMethods: [],
      hardwareRealtime: [],
    },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    updatedAt: new Date().toISOString(),
  };

  await saveProfile(newProfile);
  return newProfile;
}

export async function getProfileUrls(slug: string): Promise<ProfileUrl[]> {
  const urlsPath = path.join(PROFILES_DIR, slug, "urls.json");
  try {
    const raw = await fs.readFile(urlsPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    const profile = await getProfileBySlug(slug);
    return profile?.urls || [];
  }
}

export async function saveProfileUrls(slug: string, urls: ProfileUrl[]): Promise<void> {
  const profileDir = path.join(PROFILES_DIR, slug);
  await fs.mkdir(profileDir, { recursive: true });
  const urlsPath = path.join(profileDir, "urls.json");
  await fs.writeFile(urlsPath, JSON.stringify(urls, null, 2), "utf-8");

  const profile = await getProfileBySlug(slug);
  if (profile) {
    profile.urls = urls;
    profile.updatedAt = new Date().toISOString();
    await fs.writeFile(path.join(profileDir, "profile.json"), JSON.stringify(profile, null, 2), "utf-8");
  }
}

export async function listProfileDocuments(slug: string): Promise<{ name: string; size: number; modifiedAt: string }[]> {
  const docsDir = path.join(PROFILES_DIR, slug, "documents");
  try {
    await fs.mkdir(docsDir, { recursive: true });
    const files = await fs.readdir(docsDir);
    const results = [];

    for (const file of files) {
      if (file.startsWith(".")) continue;
      const filePath = path.join(docsDir, file);
      const stat = await fs.stat(filePath);
      results.push({
        name: file,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      });
    }

    return results;
  } catch (error) {
    console.error("Error reading profile documents:", error);
    return [];
  }
}

export async function readAllProfileDocumentsText(slug: string): Promise<{ filename: string; text: string }[]> {
  const docsDir = path.join(PROFILES_DIR, slug, "documents");
  const results: { filename: string; text: string }[] = [];

  try {
    await fs.mkdir(docsDir, { recursive: true });
    const files = await fs.readdir(docsDir);

    for (const file of files) {
      if (file.startsWith(".")) continue;
      const filePath = path.join(docsDir, file);
      const ext = path.extname(file).toLowerCase();

      try {
        if (ext === ".pdf") {
          const buffer = await fs.readFile(filePath);
          // Use dynamic require for pdf-parse to avoid bundle issues on edge
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const parsed = await pdfParse(buffer);
          results.push({ filename: file, text: parsed.text });
        } else if ([".txt", ".md", ".json", ".csv"].includes(ext)) {
          const text = await fs.readFile(filePath, "utf-8");
          results.push({ filename: file, text });
        } else {
          // Fallback text attempt
          const text = await fs.readFile(filePath, "utf-8");
          results.push({ filename: file, text });
        }
      } catch (err) {
        console.warn(`Could not parse text from ${file}:`, err);
      }
    }
  } catch (error) {
    console.error("Error reading documents text:", error);
  }

  return results;
}

export async function resetProfile(slug: string): Promise<CandidateProfile> {
  await ensureProfilesDir();
  const profileDir = path.join(PROFILES_DIR, slug);
  const docsDir = path.join(profileDir, "documents");
  const urlsPath = path.join(profileDir, "urls.json");
  const memoryPath = path.join(profileDir, "memory_state.json");

  // 1. Eliminar todos los documentos subidos de la carpeta
  try {
    const files = await fs.readdir(docsDir);
    for (const f of files) {
      if (!f.startsWith(".")) {
        await fs.unlink(path.join(docsDir, f));
      }
    }
  } catch (err) {
    console.warn(`Could not clear docs for ${slug}:`, err);
  }

  // 2. Limpiar URLs a un array vacío
  try {
    await fs.writeFile(urlsPath, "[]", "utf-8");
  } catch (err) {
    console.warn(`Could not clear urls for ${slug}:`, err);
  }

  // 3. Eliminar archivo de memoria caché
  try {
    await fs.unlink(memoryPath);
  } catch {
    // Ignore if not exists
  }

  // 4. Limpiar todas las postulaciones y análisis previos asociados
  try {
    await clearApplicationsByProfile(slug);
  } catch (err) {
    console.warn(`Could not clear applications for ${slug}:`, err);
  }

  // 5. Resetear profile.json a estado 100% limpio y en blanco (eliminando toda referencia)
  const resetProfileData: CandidateProfile = {
    slug,
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    about: "",
    urls: [],
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

  await saveProfile(resetProfileData);
  return resetProfileData;
}
