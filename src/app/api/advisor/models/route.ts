import { NextResponse } from "next/server";
import { getAvailableGeminiModels } from "@/lib/ai/gemini";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key =
      searchParams.get("apiKey") ||
      req.headers.get("x-gemini-api-key") ||
      undefined;

    const forceRefresh = searchParams.get("refresh") === "true";
    const models = await getAvailableGeminiModels(key, forceRefresh);

    return NextResponse.json({
      success: true,
      count: models.length,
      models,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Error al obtener listado de modelos Gemini:", err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
