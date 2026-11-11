import { NextResponse } from "next/server";
import { getProfileBySlug } from "@/lib/profiles";
import { generateOutreach } from "@/lib/ai/gemini";
import { getApplicationById, saveApplication } from "@/lib/applications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      profileSlug = "mi-perfil",
      rawJobDescription,
      applicationId,
      model,
      preferredModel,
      profile: profileFromBody,
    } = body;

    let jobDesc = rawJobDescription;
    let application = null;

    if (applicationId) {
      try {
        application = await getApplicationById(applicationId);
        if (application) {
          jobDesc = jobDesc || application.rawJobDescription;
        }
      } catch {
        // Ignore if local application ID not found on server disk
      }
    }

    if (!jobDesc) {
      return NextResponse.json(
        { success: false, error: "Descripción de vacante no especificada" },
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

    const outreachPitch = await generateOutreach(
      profile,
      jobDesc,
      model || preferredModel
    );

    if (application) {
      application.outreachPitch = outreachPitch;
      await saveApplication(application);
    }

    return NextResponse.json({
      success: true,
      outreachPitch,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
