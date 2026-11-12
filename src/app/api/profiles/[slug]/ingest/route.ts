import { NextResponse } from "next/server";
import { ingestProfileFromRawData } from "@/lib/ai/gemini";
import { CandidateProfile } from "@/types/profile";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const existing: CandidateProfile | null = body?.profile || null;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Datos de perfil no proporcionados en la solicitud." },
        { status: 400 }
      );
    }

    const aggregatedText: string = body?.documentsText || existing.rawDocumentsSummary || "";
    const urls = body?.urls || existing.urls || [];

    if (!aggregatedText.trim() && urls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se encontraron documentos ni URLs configuradas para consolidar este perfil.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      req.headers.get("x-gemini-api-key") ||
      body?.apiKey ||
      process.env.GEMINI_API_KEY ||
      undefined;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Por favor configura tu Gemini API Key en el menú superior para consolidar tu perfil con IA.",
        },
        { status: 401 }
      );
    }

    const chosenModel =
      req.headers.get("x-gemini-preferred-model") ||
      body?.model ||
      body?.preferredModel ||
      undefined;

    const fallbackModel =
      req.headers.get("x-gemini-fallback-model") ||
      body?.fallbackModel ||
      undefined;

    const urlStrings = urls.map((u: any) => `${u.label}: ${u.url} (${u.description || ""})`);

    const updatedProfile = await ingestProfileFromRawData(
      aggregatedText,
      urlStrings,
      chosenModel,
      apiKey,
      fallbackModel
    );

    // Retain slug, documents and merge URLs
    updatedProfile.slug = slug || existing.slug || "mi-perfil";
    updatedProfile.documents = existing.documents || [];
    if (!updatedProfile.urls || updatedProfile.urls.length === 0) {
      updatedProfile.urls = urls;
    }

    return NextResponse.json({
      success: true,
      message: "Perfil consolidado exitosamente con IA",
      profile: updatedProfile,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
