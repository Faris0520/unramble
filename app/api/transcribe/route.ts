import { NextResponse } from "next/server";
import { transcribeFloat32, wavToFloat32 } from "@/lib/whisper";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const lang = new URL(req.url).searchParams.get("lang") === "id" ? "id" : "en";
  const body = Buffer.from(await req.arrayBuffer());

  if (body.length < 1000) {
    return NextResponse.json({ error: "The recording is too short to transcribe." }, { status: 400 });
  }

  try {
    const audio = wavToFloat32(body);
    if (audio.length < 8000) {
      return NextResponse.json({ error: "The recording is too short to transcribe." }, { status: 400 });
    }
    const text = await transcribeFloat32(audio, lang);
    return NextResponse.json({ text });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Local transcription failed. Check the terminal for download progress and try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
