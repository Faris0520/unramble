"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { ButtonLink, Header } from "@/components/ui";
import { loadReport, loadSession } from "@/lib/session";
import { meterColor, meterLabel } from "@/lib/report";
import type { FeedbackReport, SentenceTag } from "@/lib/types";

const TAG_META: Record<SentenceTag, { label: string; bg: string }> = {
  situation: { label: "Situation", bg: "bg-tint-sky" },
  task: { label: "Task", bg: "bg-tint-lavender" },
  action: { label: "Action", bg: "bg-tint-mint" },
  result: { label: "Result", bg: "bg-tint-yellow" },
  filler: { label: "Filler", bg: "bg-tint-gray" },
  offtopic: { label: "Off-topic", bg: "bg-tint-rose" },
};

const STAR_KEYS: { key: "situation" | "task" | "action" | "result"; label: string }[] = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
];

function formatSeconds(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function FeedbackPage() {
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReport(loadReport());
    setHasSession(loadSession() !== null);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <Header />
        <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-steel md:px-6">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mx-auto max-w-md rounded-lg border border-hairline bg-canvas p-8 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-ink">No report yet</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Finish a practice session and its feedback appears here.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {hasSession && (
                <ButtonLink href="/session" variant="secondary">
                  Back to the session
                </ButtonLink>
              )}
              <ButtonLink href="/setup">Start a new session</ButtonLink>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { overall } = report;

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-steel">Session report</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Your session, untangled
        </h1>
        <p className="mt-2 text-[13px] text-steel">
          {report.answeredCount} of {report.totalCount} questions answered ·{" "}
          {new Date(report.createdAt).toLocaleString()}
        </p>

        <section className="mt-8 rounded-lg border border-hairline bg-canvas p-6" aria-label="Overall result">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-4xl font-semibold tracking-tight text-ink">{overall.tangled}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold text-charcoal ${
                overall.tangled < 25 ? "bg-tint-mint" : overall.tangled < 50 ? "bg-tint-yellow" : "bg-tint-rose"
              }`}
            >
              {meterLabel(overall.tangled)}
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className={`h-full origin-left rounded-full ${meterColor(overall.tangled)}`}
              style={{ transform: `scaleX(${overall.tangled / 100})` }}
            />
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-charcoal">{overall.summary}</p>
          <p className="mt-1 text-[13px] text-steel">
            0 is straight to the point, 100 is very tangled. The score is computed from measured
            filler density, sentence length, and the share of off-topic sentences.
          </p>
        </section>

        <section className="mt-8" aria-label="Sentence color legend">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TAG_META) as SentenceTag[]).map((tag) => (
              <span
                key={tag}
                className={`rounded-sm px-2 py-0.5 text-[13px] font-semibold text-charcoal ${TAG_META[tag].bg}`}
              >
                {TAG_META[tag].label}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-10">
          {report.answers.map((answer) => (
            <article
              key={answer.questionIndex}
              className="border-t border-hairline py-10 first:border-t-0 first:pt-0"
            >
              <p className="text-[13px] font-semibold text-steel">
                Question {answer.questionIndex + 1}
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-snug text-ink md:text-2xl">
                {answer.question}
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {STAR_KEYS.map(({ key, label }) => (
                  <span
                    key={key}
                    className={`rounded-sm px-2 py-0.5 text-[13px] font-semibold ${
                      answer.star[key] ? "bg-tint-mint text-charcoal" : "bg-tint-gray text-slate"
                    }`}
                  >
                    {answer.star[key] ? label : `No ${label.toLowerCase()}`}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-base leading-[1.9] text-charcoal">
                {answer.sentences.map((s, i) => {
                  if (!s.tag) return <span key={i} className="mr-1.5">{s.text} </span>;
                  return (
                    <span
                      key={i}
                      title={TAG_META[s.tag].label}
                      className={`mr-1.5 inline rounded-[4px] px-1.5 py-0.5 box-decoration-clone ${TAG_META[s.tag].bg}`}
                    >
                      {s.text}
                    </span>
                  );
                })}
              </p>

              <p className="mt-4 text-[13px] text-steel">
                Relevance {answer.relevance}/10 · Conciseness {answer.conciseness}/10 ·{" "}
                {answer.metrics.fillers} filler{" "}
                {answer.metrics.fillers === 1 ? "word" : "words"} in {answer.metrics.words} words ·{" "}
                {formatSeconds(answer.seconds)} · {answer.typed ? "typed" : "spoken"}
              </p>

              {answer.modelAnswer && (
                <div className="mt-6 rounded-md bg-tint-mint p-4">
                  <p className="text-[13px] font-semibold text-charcoal">A straighter version</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-charcoal">{answer.modelAnswer}</p>
                </div>
              )}

              {answer.tip && (
                <p className="mt-4 text-sm leading-relaxed text-slate">
                  <span className="font-semibold text-charcoal">Coach’s tip: </span>
                  {answer.tip}
                </p>
              )}

              <ButtonLink
                href={`/session?drill=${answer.questionIndex}`}
                variant="ghost"
                className="mt-5 px-2 py-1"
              >
                <ArrowClockwise size={16} aria-hidden />
                Re-answer this one
              </ButtonLink>
            </article>
          ))}
        </div>

        <div className="border-t border-hairline py-10">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Next take</h2>
          <p className="mt-2 text-base leading-relaxed text-slate">
            Run the same questions again after the tips, or set up a different role.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/session">Practice these questions again</ButtonLink>
            <ButtonLink href="/setup" variant="secondary">
              Set up a new session
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
