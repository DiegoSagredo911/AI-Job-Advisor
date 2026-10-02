import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { listProfileDocuments } from "@/lib/profiles";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const docs = await listProfileDocuments(slug);
    return NextResponse.json({ success: true, documents: docs });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se enviaron archivos" },
        { status: 400 }
      );
    }

    const docsDir = path.join(process.cwd(), "data", "profiles", slug, "documents");
    await fs.mkdir(docsDir, { recursive: true });

    const savedFiles: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const targetPath = path.join(docsDir, safeName);
      await fs.writeFile(targetPath, buffer);
      savedFiles.push(safeName);
    }

    return NextResponse.json({
      success: true,
      message: `${savedFiles.length} archivo(s) guardado(s) exitosamente`,
      files: savedFiles,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
