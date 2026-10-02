import type { SentenceSpan, SentenceTag } from "./types";

// Conservative filler lists: only words that are near-always filler in spoken
// answers, so the count stays credible. Consecutive duplicated words ("yang
// yang", "I I") are counted too, since that is the clearest rambling tell.
const FILLER_WORDS: Record<"id" | "en", string[]> = {
  id: ["eee", "umm", "um", "emm", "hmm", "eh", "gitu", "pokoknya"],
  en: ["um", "uh", "erm", "hmm", "basically", "actually", "literally"],
};

const FILLER_PHRASES: Record<"id" | "en", string[]> = {
  id: ["ya gitu", "gitu loh", "kayak gitu", "seperti itu", "apa namanya", "gimana ya"],
  en: ["you know", "i mean", "sort of", "kind of", "or something"],
};

export function splitSentences(text: string): string[] {
  const rough = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Long run-on sentences get split at commas so the color coding stays
  // readable. Rambling answers are exactly the ones with 40-word sentences.
  const out: string[] = [];
  for (const sentence of rough) {
    if (sentence.split(" ").length <= 30) {
      out.push(sentence);
      continue;
    }
    const clauses = sentence.split(/,\s*/);
    let buffer = "";
    for (const clause of clauses) {
      const candidate = buffer ? `${buffer}, ${clause}` : clause;
      if (candidate.split(" ").length > 22 && buffer) {
        out.push(`${buffer}.`);
        buffer = clause;
      } else {
        buffer = candidate;
      }
    }
    if (buffer) out.push(buffer.endsWith(".") ? buffer : `${buffer}.`);
  }
  return out;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function countFillers(text: string, language: "id" | "en"): number {
  const lower = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ")} `;
  let count = 0;

  for (const word of FILLER_WORDS[language]) {
    const re = new RegExp(` ${escapeRegex(word)} `, "g");
    count += (lower.match(re) ?? []).length;
  }
  for (const phrase of FILLER_PHRASES[language]) {
    const re = new RegExp(` ${escapeRegex(phrase)} `, "g");
    count += (lower.match(re) ?? []).length;
  }

  const tokens = lower.trim().split(" ");
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].length > 1 && tokens[i] === tokens[i - 1]) count++;
  }
  return count;
}

// 0 = straight to the point, 100 = very tangled. Every input is a real,
// computed property of the answer: filler density, run-on length, and the
// share of sentences the model tagged as filler or off-topic.
export function tangledScore(opts: {
  words: number;
  fillers: number;
  sentences: SentenceSpan[];
}): number {
  const { words, fillers, sentences } = opts;
  const fillerRatio = words > 0 ? fillers / words : 0;
  const avgWords = sentences.length > 0 ? words / sentences.length : 0;
  const weak = sentences.filter((s) => s.tag === "filler" || s.tag === "offtopic").length;
  const weakFrac = sentences.length > 0 ? weak / sentences.length : 0;

  const fillerPart = 50 * Math.min(fillerRatio / 0.1, 1);
  const runOnPart = 30 * Math.min(Math.max((avgWords - 8) / 22, 0), 1);
  const weakPart = 20 * weakFrac;

  return Math.round(Math.min(fillerPart + runOnPart + weakPart, 100));
}

export function tangledLabel(score: number, language: "en" | "id" = "en"): string {
  if (language === "id") {
    if (score < 25) return "Lurus ke tujuan";
    if (score < 50) return "Sesekali muter";
    if (score < 75) return "Sering melantur";
    return "Sangat melantur";
  }
  if (score < 25) return "Straight to the point";
  if (score < 50) return "A few detours";
  if (score < 75) return "Frequently tangled";
  return "Very tangled";
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const TAG_ORDER: SentenceTag[] = ["situation", "task", "action", "result", "filler", "offtopic"];

export function starCovered(sentences: SentenceSpan[]): { situation: boolean; task: boolean; action: boolean; result: boolean } {
  const has = (tag: SentenceTag) => sentences.some((s) => s.tag === tag);
  return { situation: has("situation"), task: has("task"), action: has("action"), result: has("result") };
}
