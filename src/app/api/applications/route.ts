import { NextResponse } from "next/server";
import {
  getAllApplications,
  getApplicationsByProfile,
  saveApplication,
} from "@/lib/applications";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profile = searchParams.get("profile");

    const applications = profile
      ? await getApplicationsByProfile(profile)
      : await getAllApplications();

    return NextResponse.json({ success: true, applications });
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
    if (!body.id) {
      body.id = "app-" + Date.now();
    }
    await saveApplication(body);
    return NextResponse.json({ success: true, application: body });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
