import { NextResponse } from "next/server";
import { getProfileBySlug } from "@/lib/profiles";
import { generateTailoredResume } from "@/lib/ai/gemini";
import { getApplicationById, saveApplication } from "@/lib/applications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileSlug = "mi-perfil", rawJobDescription, applicationId } = body;

    let jobDesc = rawJobDescription;
    let application = null;

    if (applicationId) {
      application = await getApplicationById(applicationId);
      if (application) {
        jobDesc = jobDesc || application.rawJobDescription;
      }
    }

    if (!jobDesc) {
      return NextResponse.json(
        { success: false, error: "Descripción de vacante no especificada" },
        { status: 400 }
      );
    }

    const profile = await getProfileBySlug(profileSlug);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: `Perfil '${profileSlug}' no encontrado` },
        { status: 404 }
      );
    }

    const tailoredResume = await generateTailoredResume(profile, jobDesc);

    if (application) {
      application.tailoredResume = tailoredResume;
      await saveApplication(application);
    }

    return NextResponse.json({
      success: true,
      tailoredResume,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
