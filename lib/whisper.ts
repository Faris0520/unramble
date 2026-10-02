import { pipeline, env } from "@huggingface/transformers";
import { WHISPER_MODEL_ID } from "./whisper-config";

// Weights are cached inside the project so the app stays portable and
// visibly local; after the first run no network is needed.
env.cacheDir = "./.models";
env.allowLocalModels = false;

const MODEL_ID = WHISPER_MODEL_ID;

type Transcriber = (
  audio: Float32Array,
  opts: Record<string, unknown>,
) => Promise<{ text?: string } | { text?: string }[]>;

let loader: Promise<Transcriber> | null = null;

export function loadTranscriber(): Promise<Transcriber> {
  if (!loader) {
    loader = pipeline("automatic-speech-recognition", MODEL_ID, {
      dtype: "q8",
      progress_callback: (p: { status: string; file?: string; progress?: number }) => {
        if (p.status === "progress" && p.file) {
          console.log(`[whisper] downloading ${p.file} ${Math.round(p.progress ?? 0)}%`);
        }
      },
    }) as unknown as Promise<Transcriber>;
    loader.catch(() => {
      loader = null; // allow a later request to retry a failed download
    });
  }
  return loader;
}

export async function transcribeFloat32(audio: Float32Array, language: "id" | "en"): Promise<string> {
  const transcriber = await loadTranscriber();
  const out = await transcriber(audio, {
    language: language === "id" ? "indonesian" : "english",
    task: "transcribe",
  });
  const text = Array.isArray(out) ? out[0]?.text : out.text;
  return (text ?? "").trim();
}

// Minimal WAV (PCM16) reader: walks the chunk list instead of assuming a
// 44-byte header, because browser encoders sometimes insert extra chunks.
export function wavToFloat32(buffer: Buffer): Float32Array {
  if (buffer.length < 12 || buffer.toString("ascii", 0, 4) !== "RIFF") {
    throw new Error("Expected a WAV file");
  }
  let offset = 12;
  let format = 1;
  let channels = 1;
  let sampleRate = 16000;
  let bitsPerSample = 16;
  let dataStart = -1;
  let dataLength = 0;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === "fmt ") {
      format = buffer.readUInt16LE(body);
      channels = buffer.readUInt16LE(body + 2);
      sampleRate = buffer.readUInt32LE(body + 4);
      bitsPerSample = buffer.readUInt16LE(body + 14);
    } else if (id === "data") {
      dataStart = body;
      dataLength = Math.min(size, buffer.length - body);
    }
    offset = body + size + (size % 2);
  }

  if (dataStart < 0) throw new Error("WAV file has no data chunk");
  if (format !== 1 || bitsPerSample !== 16) throw new Error("Only 16-bit PCM WAV is supported");

  const bytesPerSample = bitsPerSample / 8;
  const frames = Math.floor(dataLength / (bytesPerSample * channels));
  const floats = new Float32Array(frames);

  // Average all channels down to mono while converting.
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < channels; c++) {
      const pos = dataStart + (i * channels + c) * bytesPerSample;
      sum += pcm16ToFloat(buffer.readInt16LE(pos));
    }
    floats[i] = sum / channels;
  }

  if (sampleRate !== 16000) {
    return resampleLinear(floats, sampleRate, 16000);
  }
  return floats;
}

function pcm16ToFloat(v: number): number {
  return v / 32768;
}

function resampleLinear(input: Float32Array, from: number, to: number): Float32Array {
  const ratio = from / to;
  const outLength = Math.floor(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const src = i * ratio;
    const i0 = Math.floor(src);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = src - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}
