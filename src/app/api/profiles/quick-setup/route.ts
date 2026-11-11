import { NextResponse } from "next/server";
import { ingestProfileFromRawData } from "@/lib/ai/gemini";
import { ProfileUrl, CandidateProfile, ProfileDocument } from "@/types/profile";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fullName = (formData.get("fullName") as string)?.trim();
    const headline = (formData.get("headline") as string)?.trim() || "Profesional TI";
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

    const slug = "mi-perfil";

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

    // Extract text from uploaded files directly in memory
    let accumulatedText = pastedText ? `=== TEXTO INGRESADO MANUALMENTE ===\n${pastedText}\n\n` : "";
    const uploadedDocs: ProfileDocument[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        let docText = "";
        const isPdf = safeName.toLowerCase().endsWith(".pdf");

        try {
          if (isPdf) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const parsed = await pdfParse(buffer);
            docText = parsed.text;
            accumulatedText += `=== DOCUMENTO PDF: ${safeName} ===\n${parsed.text}\n\n`;
          } else {
            const txt = buffer.toString("utf-8");
            docText = txt;
            accumulatedText += `=== DOCUMENTO: ${safeName} ===\n${txt}\n\n`;
          }
        } catch (err) {
          console.warn(`Error extracting text from ${safeName}:`, err);
        }

        uploadedDocs.push({
          name: safeName,
          size: file.size,
          modifiedAt: new Date().toISOString(),
          extractedText: docText,
        });
      }
    }

    // If no text was provided at all, create basic seed
    if (!accumulatedText.trim()) {
      accumulatedText = `Nombre: ${fullName}\nRol: ${headline}\n`;
    }

    // Run AI Ingestion
    const urlStrings = urls.map((u) => `${u.label}: ${u.url}`);
    let structuredProfile: CandidateProfile;

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

    structuredProfile.documents = uploadedDocs;

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
