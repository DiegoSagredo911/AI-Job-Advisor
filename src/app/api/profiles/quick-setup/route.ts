import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { createProfile, saveProfile, saveProfileUrls } from "@/lib/profiles";
import { ingestProfileFromRawData } from "@/lib/ai/gemini";
import { ProfileUrl } from "@/types/profile";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fullName = (formData.get("fullName") as string)?.trim();
    const headline = (formData.get("headline") as string)?.trim() || "Profesional TI";
    const customSlug = (formData.get("slug") as string)?.trim();
    const linkedinUrl = (formData.get("linkedinUrl") as string)?.trim();
    const portfolioUrl = (formData.get("portfolioUrl") as string)?.trim();
    const githubUrl = (formData.get("githubUrl") as string)?.trim();
    const pastedText = (formData.get("pastedText") as string)?.trim() || "";

    const files = formData.getAll("cvFiles") as File[];

    if (!fullName) {
      return NextResponse.json(
        { success: false, error: "El nombre completo es obligatorio." },
        { status: 400 }
      );
    }

    // Generate safe unique slug
    const slug = "mi-perfil";

    const profileDir = path.join(process.cwd(), "data", "profiles", slug);
    const docsDir = path.join(profileDir, "documents");
    await fs.mkdir(docsDir, { recursive: true });

    // Build URLs array
    const urls: ProfileUrl[] = [];
    if (linkedinUrl) {
      urls.push({ label: "LinkedIn", url: linkedinUrl, description: "Perfil profesional" });
    }
    if (portfolioUrl) {
      urls.push({ label: "Portafolio / Web", url: portfolioUrl, description: "Sitio web personal" });
    }
    if (githubUrl) {
      urls.push({ label: "GitHub", url: githubUrl, description: "Repositorio de código" });
    }

    // Save uploaded files
    let accumulatedText = pastedText ? `=== TEXTO INGRESADO MANUALMENTE ===\n${pastedText}\n\n` : "";

    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const targetPath = path.join(docsDir, safeName);
        await fs.writeFile(targetPath, buffer);

        const ext = path.extname(safeName).toLowerCase();
        try {
          if (ext === ".pdf") {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const parsed = await pdfParse(buffer);
            accumulatedText += `=== DOCUMENTO PDF: ${safeName} ===\n${parsed.text}\n\n`;
          } else {
            const txt = buffer.toString("utf-8");
            accumulatedText += `=== DOCUMENTO: ${safeName} ===\n${txt}\n\n`;
          }
        } catch (err) {
          console.warn(`Error extracting text from ${safeName}:`, err);
        }
      }
    }

    // If no text was provided at all, create basic seed
    if (!accumulatedText.trim()) {
      accumulatedText = `Nombre: ${fullName}\nRol: ${headline}\n`;
    }

    // Run AI Ingestion
    const urlStrings = urls.map((u) => `${u.label}: ${u.url}`);
    let structuredProfile;

    try {
      structuredProfile = await ingestProfileFromRawData(accumulatedText, urlStrings);
      structuredProfile.slug = slug;
      structuredProfile.fullName = fullName || structuredProfile.fullName;
      if (headline && headline !== "Profesional TI") {
        structuredProfile.headline = headline;
      }
      structuredProfile.urls = urls.length > 0 ? urls : structuredProfile.urls;
    } catch (aiErr) {
      console.warn("AI ingestion fallback during quick setup:", aiErr);
      // Create minimal valid profile if AI call is not reachable
      structuredProfile = {
        slug,
        fullName,
        headline,
        email: "",
        phone: "",
        location: "",
        about: `${fullName} — ${headline}. Perfil configurado para búsqueda y postulación a vacantes.`,
        urls,
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
        rawDocumentsSummary: `Creado mediante configuración rápida con ${files.length} archivo(s).`,
        updatedAt: new Date().toISOString(),
      };
    }

    await saveProfile(structuredProfile);
    await saveProfileUrls(slug, urls);

    return NextResponse.json({
      success: true,
      profile: structuredProfile,
      message: `¡Perfil para ${fullName} configurado exitosamente!`,
    });
  } catch (error: unknown) {
    console.error("Error in quick-setup:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
