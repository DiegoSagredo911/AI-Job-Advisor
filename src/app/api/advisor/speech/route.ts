import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function pcmToWav(
  pcmBase64: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): string {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const wavHeader = Buffer.alloc(44);

  // RIFF chunk
  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write("WAVE", 8);

  // fmt sub-chunk
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // 1 = PCM
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer]).toString("base64");
}

export async function POST(req: Request) {
  try {
    const { text, voice = "Puck" } = await req.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Texto requerido para síntesis de voz." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY no configurada." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Solicitar síntesis de voz realista mediante la API de interacciones de Gemini
    const result: any = await ai.interactions.create({
      model: "gemini-3.1-flash-tts-preview",
      input: text.trim(),
      response_format: { type: "audio" },
      generation_config: {
        speech_config: [
          { voice: voice || "Puck" }
        ]
      }
    });

    if (!result?.output_audio?.data) {
      throw new Error("No se recibieron datos de audio desde Gemini.");
    }

    const sampleRate = result.output_audio.sample_rate || 24000;
    const wavBase64 = pcmToWav(result.output_audio.data, sampleRate);

    return NextResponse.json({
      success: true,
      audioBase64: wavBase64,
      mimeType: "audio/wav",
      voiceUsed: voice,
      provider: "gemini-3.1-flash-tts",
    });
  } catch (error: unknown) {
    console.error("Error en síntesis de voz Gemini TTS:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Fallo en generación de voz Gemini.",
      },
      { status: 500 }
    );
  }
}
