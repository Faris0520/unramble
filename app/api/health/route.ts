import { NextResponse } from "next/server";
import { ollamaHealth, OLLAMA_MODEL_NAME } from "@/lib/ollama";
import { WHISPER_MODEL_ID } from "@/lib/whisper-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await ollamaHealth();
  return NextResponse.json({ ...health, model: OLLAMA_MODEL_NAME, whisper: WHISPER_MODEL_ID });
}
