import { NextResponse } from "next/server";
import { getProfileBySlug } from "@/lib/profiles";
import { analyzeJobOffer } from "@/lib/ai/gemini";
import { saveApplication } from "@/lib/applications";
import { JobApplication } from "@/types/advisor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      profileSlug = "mi-perfil",
      rawJobDescription,
      saveAsApplication,
      model,
      preferredModel,
      profile: profileFromBody,
    } = body;

    if (!rawJobDescription || rawJobDescription.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: "Por favor proporciona la descripción o texto de la oferta laboral" },
        { status: 400 }
      );
    }

    const profile = profileFromBody || (await getProfileBySlug(profileSlug));
    if (!profile) {
      return NextResponse.json(
        { success: false, error: `Perfil '${profileSlug}' no encontrado` },
        { status: 404 }
      );
    }

    const apiKey =
      req.headers.get("x-gemini-api-key") ||
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      undefined;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Por favor configura tu Gemini API Key en el menú superior para analizar vacantes.",
        },
        { status: 401 }
      );
    }

    const chosenModel =
      req.headers.get("x-gemini-preferred-model") ||
      body.model ||
      body.preferredModel ||
      undefined;

    const fallbackModel =
      req.headers.get("x-gemini-fallback-model") ||
      body.fallbackModel ||
      undefined;

    const analysis = await analyzeJobOffer(
      profile,
      rawJobDescription,
      chosenModel,
      apiKey,
      fallbackModel
    );

    let application: JobApplication | undefined = undefined;

    if (saveAsApplication) {
      const id = "app-" + Date.now();
      application = {
        id,
        profileSlug,
        jobTitle: analysis.jobTitle || "Vacante Analizada",
        companyName: analysis.companyName || "Empresa Confidencial",
        rawJobDescription,
        status: "draft",
        analysis,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveApplication(application);
    }

    return NextResponse.json({
      success: true,
      analysis,
      application,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
