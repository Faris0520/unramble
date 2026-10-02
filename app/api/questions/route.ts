import { NextResponse } from "next/server";
import { ollamaHealth, ollamaJson, OLLAMA_MODEL_NAME } from "@/lib/ollama";
import { questionsSystemPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

const QUESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: { type: "string" },
    },
  },
};

export async function POST(req: Request) {
  let body: { jobDescription?: string; cv?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const jobDescription = (body.jobDescription ?? "").trim();
  const cv = (body.cv ?? "").trim();
  const language = body.language === "id" ? "id" : "en";

  if (jobDescription.length < 40) {
    return NextResponse.json(
      { error: "Paste the full job description so the questions can be specific." },
      { status: 400 },
    );
  }
  if (cv.length < 20) {
    return NextResponse.json(
      { error: "Add a few CV bullets so the questions fit this candidate." },
      { status: 400 },
    );
  }

  const health = await ollamaHealth();
  if (!health.ollama) {
    return NextResponse.json(
      {
        code: "ollama_missing",
        error:
          "Ollama is not reachable on this machine. Install it, keep it running, then check again.",
      },
      { status: 503 },
    );
  }
  if (!health.hasModel) {
    return NextResponse.json(
      {
        code: "model_missing",
        error: `The model ${OLLAMA_MODEL_NAME} is not pulled yet. Run: ollama pull ${OLLAMA_MODEL_NAME}`,
      },
      { status: 503 },
    );
  }

  try {
    const out = await ollamaJson<{ questions: string[] }>({
      system: questionsSystemPrompt(language),
      prompt: `Job description:\n${jobDescription}\n\nCandidate CV:\n${cv}`,
      schema: QUESTIONS_SCHEMA,
      temperature: 0.7,
      numPredict: 900,
      timeoutMs: 240_000,
    });
    const questions = (out.questions ?? [])
      .map((q) => q.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (questions.length < 4) {
      return NextResponse.json(
        { code: "generation_failed", error: "The model returned too few questions. Try again." },
        { status: 500 },
      );
    }
    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Question generation failed.";
    return NextResponse.json({ code: "generation_failed", error: message }, { status: 500 });
  }
}
