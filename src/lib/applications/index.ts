import fs from "fs/promises";
import path from "path";
import { JobApplication } from "@/types/advisor";

const APPLICATIONS_FILE = path.join(process.cwd(), "data", "applications.json");

export async function getAllApplications(): Promise<JobApplication[]> {
  try {
    const raw = await fs.readFile(APPLICATIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function getApplicationsByProfile(profileSlug: string): Promise<JobApplication[]> {
  const all = await getAllApplications();
  return all.filter((app) => app.profileSlug === profileSlug);
}

export async function getApplicationById(id: string): Promise<JobApplication | null> {
  const all = await getAllApplications();
  return all.find((app) => app.id === id) || null;
}

export async function saveApplication(app: JobApplication): Promise<void> {
  const all = await getAllApplications();
  const index = all.findIndex((a) => a.id === app.id);

  app.updatedAt = new Date().toISOString();
  if (index >= 0) {
    all[index] = app;
  } else {
    app.createdAt = app.createdAt || new Date().toISOString();
    all.unshift(app);
  }

  await fs.mkdir(path.dirname(APPLICATIONS_FILE), { recursive: true });
  await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(all, null, 2), "utf-8");
}

export async function deleteApplication(id: string): Promise<boolean> {
  const all = await getAllApplications();
  const filtered = all.filter((a) => a.id !== id);
  if (filtered.length !== all.length) {
    await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  }
  return false;
}

export async function clearApplicationsByProfile(profileSlug?: string): Promise<void> {
  try {
    if (!profileSlug) {
      await fs.writeFile(APPLICATIONS_FILE, "[]", "utf-8");
      return;
    }
    const all = await getAllApplications();
    const filtered = all.filter((a) => a.profileSlug !== profileSlug);
    await fs.mkdir(path.dirname(APPLICATIONS_FILE), { recursive: true });
    await fs.writeFile(APPLICATIONS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not clear applications:", err);
  }
}

