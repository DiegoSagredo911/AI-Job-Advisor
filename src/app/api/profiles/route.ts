import { NextResponse } from "next/server";
import { getProfilesList, createProfile } from "@/lib/profiles";

export async function GET() {
  try {
    const list = await getProfilesList();
    return NextResponse.json({ success: true, profiles: list });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, fullName, headline } = body;

    if (!slug || !fullName) {
      return NextResponse.json(
        { success: false, error: "El slug y nombre completo son obligatorios" },
        { status: 400 }
      );
    }

    const created = await createProfile(slug, fullName, headline);
    return NextResponse.json({ success: true, profile: created });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
