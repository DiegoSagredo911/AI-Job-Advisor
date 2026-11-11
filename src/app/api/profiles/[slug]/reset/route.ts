import { NextResponse } from "next/server";
import { resetProfile } from "@/lib/profiles";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    let profile = null;
    try {
      profile = await resetProfile(slug);
    } catch {
      // Browser handles reset on Vercel
    }

    return NextResponse.json({
      success: true,
      profile,
      message: `Perfil '${slug}' reiniciado con éxito en tu navegador.`,
    });
  } catch (error: unknown) {
    console.error("Error resetting profile:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
