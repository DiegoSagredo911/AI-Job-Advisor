import { NextResponse } from "next/server";
import {
  getProfileBySlug,
  saveProfile,
  readAllProfileDocumentsText,
  getProfileUrls,
} from "@/lib/profiles";
import { ingestProfileFromRawData } from "@/lib/ai/gemini";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const existing = await getProfileBySlug(slug);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    const docs = await readAllProfileDocumentsText(slug);
    const urls = await getProfileUrls(slug);

    if (docs.length === 0 && urls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se encontraron documentos en la carpeta documents/ ni URLs configuradas para este perfil.",
        },
        { status: 400 }
      );
    }

    const aggregatedText = docs
      .map((d) => `=== DOCUMENTO: ${d.filename} ===\n${d.text}`)
      .join("\n\n");

    const urlStrings = urls.map((u) => `${u.label}: ${u.url} (${u.description || ""})`);

    const updatedProfile = await ingestProfileFromRawData(aggregatedText, urlStrings);

    // Retain slug and merge URLs
    updatedProfile.slug = slug;
    if (!updatedProfile.urls || updatedProfile.urls.length === 0) {
      updatedProfile.urls = urls;
    }

    await saveProfile(updatedProfile);

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
