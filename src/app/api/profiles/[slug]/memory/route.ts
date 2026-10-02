import { NextResponse } from "next/server";
import { getMemoryState, ensureProfileMemorySynchronized } from "@/lib/memory";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const memory = await getMemoryState(slug);
    return NextResponse.json({ success: true, memory });
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
    const body = await req.json().catch(() => ({}));
    const force = Boolean(body.force);

    const result = await ensureProfileMemorySynchronized(slug, force);
    const memory = await getMemoryState(slug);

    return NextResponse.json({
      success: true,
      refreshed: result.refreshed,
      reason: result.reason,
      memory,
      profile: result.profile,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
