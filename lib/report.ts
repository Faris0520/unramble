import type { FeedbackReport, ScoredAnswer } from "./types";
import { tangledLabel } from "./fillers";

// The overall score and every sentence of the summary come from real
// properties of the session: measured fillers, model scores, detected gaps.
export function buildOverall(answers: ScoredAnswer[], totalCount: number): FeedbackReport["overall"] {
  const tangled = answers.length
    ? Math.round(answers.reduce((sum, a) => sum + a.metrics.tangled, 0) / answers.length)
    : 0;

  const parts: string[] = [];
  if (answers.length < totalCount) {
    parts.push(`${answers.length} of ${totalCount} questions answered.`);
  }
  const fillers = answers.reduce((sum, a) => sum + a.metrics.fillers, 0);
  const words = answers.reduce((sum, a) => sum + a.metrics.words, 0);
  if (answers.length) {
    parts.push(
      fillers === 0
        ? `No filler words detected across ${words} words.`
        : `${fillers} filler words across ${words} words.`,
    );
  }
  const missingResult = answers.filter((a) => !a.star.result).length;
  if (missingResult > 0) {
    parts.push(
      missingResult === 1
        ? "1 answer never reached a Result."
        : `${missingResult} answers never reached a Result.`,
    );
  }
  const missingAction = answers.filter((a) => !a.star.action).length;
  if (missingAction > 0) {
    parts.push(
      missingAction === 1
        ? "1 answer stayed in theory without an Action."
        : `${missingAction} answers stayed in theory without an Action.`,
    );
  }
  const best = answers.reduce<ScoredAnswer | null>(
    (top, a) => (!top || a.relevance > top.relevance ? a : top),
    null,
  );
  if (best && best.relevance >= 7) {
    parts.push(`Strongest answer: "${best.question}" (${best.relevance}/10 relevance).`);
  }

  return { tangled, summary: parts.join(" ") };
}

export function meterColor(score: number): string {
  if (score < 25) return "bg-success";
  if (score < 50) return "bg-primary";
  if (score < 75) return "bg-warning";
  return "bg-error";
}

export function meterLabel(score: number): string {
  return tangledLabel(score, "en");
}
