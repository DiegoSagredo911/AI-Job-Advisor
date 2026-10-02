import { NextRequest, NextResponse } from "next/server";
import { Packer } from "docx";
import { getProfileBySlug } from "@/lib/profiles";
import { getApplicationById } from "@/lib/applications";
import { createResumeDocx, ResumeDocxFormat } from "@/lib/export/docx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileSlug, applicationId, format = "harvard", customResume } = body;

    if (!profileSlug) {
      return NextResponse.json(
        { error: "Se requiere profileSlug" },
        { status: 400 }
      );
    }

    const profile = await getProfileBySlug(profileSlug);
    if (!profile) {
      return NextResponse.json(
        { error: `Perfil ${profileSlug} no encontrado` },
        { status: 404 }
      );
    }

    let tailoredResume = customResume || null;

    if (!tailoredResume && applicationId) {
      const app = await getApplicationById(applicationId);
      if (app && app.tailoredResume) {
        tailoredResume = app.tailoredResume;
      }
    }

    const docxDocument = await createResumeDocx({
      profile,
      tailoredResume,
      format: (format === "ats" ? "ats" : "harvard") as ResumeDocxFormat,
    });

    const buffer = await Packer.toBuffer(docxDocument);
    const uint8Array = new Uint8Array(buffer);

    const safeName = profile.fullName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const styleLabel = format === "ats" ? "ATS" : "Harvard";
    const typeLabel = tailoredResume ? "Adaptado" : "Generico";
    const filename = `CV_${styleLabel}_${typeLabel}_${safeName}.docx`;

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Error generating DOCX resume:", err);
    return NextResponse.json(
      {
        error: `Error al generar documento Word: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 }
    );
  }
}
