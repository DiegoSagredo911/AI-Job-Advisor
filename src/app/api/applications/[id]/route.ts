import { NextResponse } from "next/server";
import {
  getApplicationById,
  saveApplication,
  deleteApplication,
} from "@/lib/applications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Postulación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    body.id = id;
    await saveApplication(body);
    return NextResponse.json({ success: true, application: body });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteApplication(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
