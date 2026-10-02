import { NextResponse } from "next/server";
import {
  getProfileBySlug,
  saveProfile,
  listProfileDocuments,
  getProfileUrls,
} from "@/lib/profiles";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const profile = await getProfileBySlug(slug);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    const documents = await listProfileDocuments(slug);
    const urls = await getProfileUrls(slug);

    return NextResponse.json({
      success: true,
      profile,
      documents,
      urls,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await req.json();

    if (body.slug !== slug) {
      body.slug = slug;
    }

    await saveProfile(body);
    return NextResponse.json({ success: true, profile: body });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
