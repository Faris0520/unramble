const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "gemma3:4b";

export const OLLAMA_MODEL_NAME = MODEL;
export const OLLAMA_BASE_URL = OLLAMA_URL;

export interface OllamaHealth {
  ollama: boolean;
  models: string[];
  hasModel: boolean;
}

export async function ollamaHealth(): Promise<OllamaHealth> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!res.ok) return { ollama: false, models: [], hasModel: false };
    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
    return { ollama: true, models, hasModel: models.some((n) => n.startsWith(MODEL)) };
  } catch {
    return { ollama: false, models: [], hasModel: false };
  }
}

export async function ollamaJson<T>(opts: {
  system: string;
  prompt: string;
  schema: object;
  temperature?: number;
  numPredict?: number;
  timeoutMs?: number;
}): Promise<T> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      format: opts.schema,
      options: {
        temperature: opts.temperature ?? 0.2,
        num_predict: opts.numPredict ?? 1024,
      },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 180_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama returned ${res.status}. ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content ?? "";
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("The model returned malformed JSON. Try again.");
  }
}
