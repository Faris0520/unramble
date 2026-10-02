import { NextResponse } from "next/server";
import { ollamaHealth, ollamaJson, OLLAMA_MODEL_NAME } from "@/lib/ollama";
import { scoringSystemPrompt } from "@/lib/prompts";
import { splitSentences, countWords, countFillers, tangledScore, starCovered } from "@/lib/fillers";
import type { Language, ScoredAnswer, SentenceTag } from "@/lib/types";

export const runtime = "nodejs";

const TAGS = new Set<SentenceTag>([
  "situation",
  "task",
  "action",
  "result",
  "filler",
  "offtopic",
]);

const SCORE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sentences", "relevance", "conciseness", "tip", "model_answer"],
  properties: {
    sentences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["i", "tag"],
        properties: {
          i: { type: "integer", minimum: 1 },
          tag: {
            type: "string",
            enum: ["situation", "task", "action", "result", "filler", "offtopic"],
          },
        },
      },
    },
    relevance: { type: "integer", minimum: 0, maximum: 10 },
    conciseness: { type: "integer", minimum: 0, maximum: 10 },
    tip: { type: "string" },
    model_answer: { type: "string" },
  },
};

export async function POST(req: Request) {
  let body: {
    language?: string;
    questionIndex?: number;
    question?: string;
    transcript?: string;
    seconds?: number;
    typed?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const language: Language = body.language === "id" ? "id" : "en";
  const question = (body.question ?? "").trim();
  const transcript = (body.transcript ?? "").trim();
  if (!question || !transcript) {
    return NextResponse.json({ error: "Missing question or transcript." }, { status: 400 });
  }

  const health = await ollamaHealth();
  if (!health.ollama) {
    return NextResponse.json(
      { code: "ollama_missing", error: "Ollama is not reachable. Start it, then retry scoring." },
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

  const sentences = splitSentences(transcript);
  const numbered = sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");

  try {
    const out = await ollamaJson<{
      sentences?: { i: number; tag: string }[];
      relevance?: number;
      conciseness?: number;
      tip?: string;
      model_answer?: string;
    }>({
      system: scoringSystemPrompt(language),
      prompt: `Interview question: ${question}\n\nCandidate's answer, numbered sentences:\n${numbered}`,
      schema: SCORE_SCHEMA,
      temperature: 0.2,
      numPredict: 1400,
      timeoutMs: 240_000,
    });

    const tagMap = new Map<number, SentenceTag>();
    for (const s of out.sentences ?? []) {
      const tag = s.tag as SentenceTag;
      if (TAGS.has(tag) && Number.isInteger(s.i) && s.i >= 1 && s.i <= sentences.length) {
        tagMap.set(s.i, tag);
      }
    }
    const spans = sentences.map((text, idx) => ({ text, tag: tagMap.get(idx + 1) }));

    const words = countWords(transcript);
    const fillers = countFillers(transcript, language);
    const clamp10 = (n: number | undefined) =>
      Math.max(0, Math.min(10, Math.round(Number(n ?? 0))));

    const scored: ScoredAnswer = {
      questionIndex: Math.max(0, Math.round(Number(body.questionIndex ?? 0))),
      question,
      transcript,
      seconds: Math.max(0, Math.round(Number(body.seconds ?? 0))),
      typed: Boolean(body.typed),
      star: starCovered(spans),
      relevance: clamp10(out.relevance),
      conciseness: clamp10(out.conciseness),
      tip: out.tip ?? "",
      modelAnswer: out.model_answer ?? "",
      sentences: spans,
      metrics: {
        words,
        fillers,
        tangled: tangledScore({ words, fillers, sentences: spans }),
      },
    };
    return NextResponse.json({ scored });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scoring failed.";
    return NextResponse.json({ code: "scoring_failed", error: message }, { status: 500 });
  }
}
