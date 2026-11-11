import { NextResponse } from "next/server";
import { ProfileDocument } from "@/types/profile";

export async function GET() {
  return NextResponse.json({ success: true, documents: [] });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se enviaron archivos" },
        { status: 400 }
      );
    }

    const uploadedDocs: ProfileDocument[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      let extractedText = "";
      const isPdf = safeName.toLowerCase().endsWith(".pdf");

      try {
        if (isPdf) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const parsed = await pdfParse(buffer);
          extractedText = parsed.text;
        } else {
          extractedText = buffer.toString("utf-8");
        }
      } catch (err) {
        console.warn(`Could not parse text from ${safeName}:`, err);
      }

      uploadedDocs.push({
        name: safeName,
        size: file.size,
        modifiedAt: new Date().toISOString(),
        extractedText,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedDocs.length} archivo(s) procesado(s) y guardado(s) en tu navegador`,
      documents: uploadedDocs,
      files: uploadedDocs.map((d) => d.name),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
