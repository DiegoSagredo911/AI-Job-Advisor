import { NextResponse } from "next/server";
import { resetProfile } from "@/lib/profiles";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const profile = await resetProfile(slug);

    return NextResponse.json({
      success: true,
      profile,
      message: `Perfil '${slug}' reiniciado con éxito. Se han eliminado todas las referencias, postulaciones, documentos y URLs previas.`,
    });
  } catch (error: unknown) {
    console.error("Error resetting profile:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
