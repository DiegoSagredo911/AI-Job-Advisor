import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { MemoryState, CandidateProfile } from "@/types/profile";
import {
  getProfileBySlug,
  saveProfile,
  readAllProfileDocumentsText,
  getProfileUrls,
} from "@/lib/profiles";
import { ingestProfileFromRawData } from "@/lib/ai/gemini";
import { buildProfileContext } from "@/lib/ai/prompts";

const PROFILES_DIR = path.join(process.cwd(), "data", "profiles");

interface StoredMemoryFile {
  fingerprint: string;
  lastSyncAt: string;
  filesSnapshot: { name: string; size: number; mtime: number }[];
  urlsHash: string;
  cachedContext: string;
}

export async function computeProfileFingerprint(slug: string): Promise<{
  fingerprint: string;
  filesSnapshot: { name: string; size: number; mtime: number }[];
  urlsHash: string;
}> {
  const profileDir = path.join(PROFILES_DIR, slug);
  const docsDir = path.join(profileDir, "documents");
  const urlsPath = path.join(profileDir, "urls.json");

  const filesSnapshot: { name: string; size: number; mtime: number }[] = [];

  try {
    await fs.mkdir(docsDir, { recursive: true });
    const files = await fs.readdir(docsDir);

    for (const f of files) {
      if (f.startsWith(".")) continue;
      const stat = await fs.stat(path.join(docsDir, f));
      filesSnapshot.push({
        name: f,
        size: stat.size,
        mtime: stat.mtimeMs,
      });
    }
  } catch (err) {
    console.warn("Could not read docs dir for fingerprinting:", err);
  }

  // Sort files for deterministic hashing
  filesSnapshot.sort((a, b) => a.name.localeCompare(b.name));

  let urlsContent = "";
  try {
    urlsContent = await fs.readFile(urlsPath, "utf-8");
  } catch {
    urlsContent = "[]";
  }

  const urlsHash = crypto.createHash("sha256").update(urlsContent).digest("hex");
  const filesString = JSON.stringify(filesSnapshot);
  const combined = `${filesString}::${urlsHash}`;
  const fingerprint = crypto.createHash("sha256").update(combined).digest("hex");

  return { fingerprint, filesSnapshot, urlsHash };
}

export async function getMemoryState(slug: string): Promise<MemoryState> {
  const profileDir = path.join(PROFILES_DIR, slug);
  const memoryPath = path.join(profileDir, "memory_state.json");

  const current = await computeProfileFingerprint(slug);

  let stored: StoredMemoryFile | null = null;
  try {
    const raw = await fs.readFile(memoryPath, "utf-8");
    stored = JSON.parse(raw);
  } catch {
    stored = null;
  }

  if (!stored) {
    return {
      slug,
      isUpToDate: false,
      lastSyncAt: "Nunca",
      fingerprint: current.fingerprint,
      documentCount: current.filesSnapshot.length,
      urlCount: 0,
      changesDetected: {
        hasChanges: true,
        modifiedDocuments: current.filesSnapshot.map((f) => f.name),
        urlsChanged: true,
      },
    };
  }

  const urlsChanged = stored.urlsHash !== current.urlsHash;
  const storedFileNames = new Set(stored.filesSnapshot.map((f) => f.name));
  const currentFileNames = new Set(current.filesSnapshot.map((f) => f.name));

  const modifiedDocs: string[] = [];

  for (const cf of current.filesSnapshot) {
    const sf = stored.filesSnapshot.find((f) => f.name === cf.name);
    if (!sf || sf.size !== cf.size || Math.abs(sf.mtime - cf.mtime) > 1000) {
      modifiedDocs.push(cf.name);
    }
  }

  for (const name of storedFileNames) {
    if (!currentFileNames.has(name)) {
      modifiedDocs.push(`(eliminado: ${name})`);
    }
  }

  const isUpToDate = stored.fingerprint === current.fingerprint;

  return {
    slug,
    isUpToDate,
    lastSyncAt: stored.lastSyncAt,
    fingerprint: current.fingerprint,
    documentCount: current.filesSnapshot.length,
    urlCount: 0,
    changesDetected: {
      hasChanges: !isUpToDate,
      modifiedDocuments: modifiedDocs,
      urlsChanged,
    },
    cachedContextSummary: stored.cachedContext?.slice(0, 150) + "...",
  };
}

export async function ensureProfileMemorySynchronized(
  slug: string,
  force: boolean = false
): Promise<{ profile: CandidateProfile; refreshed: boolean; reason: string }> {
  const profileDir = path.join(PROFILES_DIR, slug);
  const memoryPath = path.join(profileDir, "memory_state.json");

  const memoryState = await getMemoryState(slug);
  const existingProfile = await getProfileBySlug(slug);

  // If memory is up-to-date and profile exists, use local memory instantly (0 tokens consumed!)
  if (!force && memoryState.isUpToDate && existingProfile) {
    console.log(`[Memoria Persistente] Perfil '${slug}' sincronizado. Usando caché local (0 llamadas a IA).`);
    return {
      profile: existingProfile,
      refreshed: false,
      reason: "Memoria local persistente al día. Se reutilizó el contexto sin consumir tokens.",
    };
  }

  console.log(`[Memoria Persistente] Cambios detectados o sincronización forzada para '${slug}'. Actualizando memoria con IA...`);

  // Read documents and URLs
  const docs = await readAllProfileDocumentsText(slug);
  const urls = await getProfileUrls(slug);

  let updatedProfile: CandidateProfile;

  if (docs.length === 0 && urls.length === 0 && existingProfile) {
    updatedProfile = existingProfile;
  } else {
    const aggregatedText = docs
      .map((d) => `=== DOCUMENTO: ${d.filename} ===\n${d.text}`)
      .join("\n\n");
    const urlStrings = urls.map((u) => `${u.label}: ${u.url} (${u.description || ""})`);

    try {
      updatedProfile = await ingestProfileFromRawData(aggregatedText, urlStrings);
      updatedProfile.slug = slug;
      if (!updatedProfile.urls || updatedProfile.urls.length === 0) {
        updatedProfile.urls = urls;
      }
    } catch (err) {
      console.warn("Falla en IA durante refresh de memoria, usando perfil existente:", err);
      updatedProfile = existingProfile || {
        slug,
        fullName: slug.replace(/-/g, " "),
        headline: "Profesional TI",
        email: "",
        phone: "",
        location: "",
        about: "",
        urls,
        skills: { languages: [], frameworks: [], databases: [], cloudDevOps: [], toolsMethods: [], hardwareRealtime: [] },
        experience: [],
        projects: [],
        education: [],
        certifications: [],
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Save profile
  await saveProfile(updatedProfile);

  // Generate compact cached prompt context
  const cachedContext = buildProfileContext(updatedProfile);

  // Save new memory snapshot
  const current = await computeProfileFingerprint(slug);
  const newStored: StoredMemoryFile = {
    fingerprint: current.fingerprint,
    lastSyncAt: new Date().toISOString(),
    filesSnapshot: current.filesSnapshot,
    urlsHash: current.urlsHash,
    cachedContext,
  };

  await fs.writeFile(memoryPath, JSON.stringify(newStored, null, 2), "utf-8");

  return {
    profile: updatedProfile,
    refreshed: true,
    reason: "Se detectaron modificaciones en archivos/URLs. Memoria persistente sincronizada exitosamente.",
  };
}
