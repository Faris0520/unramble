"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, TEXTAREA_CLASS } from "@/components/ui";
import { Navbar } from "@/components/Navbar";
import { LocalAiPanel, type HealthData } from "@/components/LocalAiPanel";
import { saveSession, saveSetup, loadSetup } from "@/lib/session";
import type { Language, SessionData } from "@/lib/types";

interface FormError {
  message: string;
  code?: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [cv, setCv] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [checking, setChecking] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<FormError | null>(null);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      setHealth((await res.json()) as HealthData);
    } catch {
      setHealth(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const saved = loadSetup();
    if (saved) {
      setJobDescription(saved.jobDescription);
      setCv(saved.cv);
      setLanguage(saved.language);
    }
    void checkHealth();
  }, [checkHealth]);

  async function generate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobDescription, cv, language }),
      });
      const data = (await res.json()) as { questions?: string[]; error?: string; code?: string };
      if (!res.ok || !data.questions) {
        setError({ message: data.error ?? "Question generation failed.", code: data.code });
        if (data.code === "ollama_missing" || data.code === "model_missing") {
          void checkHealth();
        }
        return;
      }
      saveSetup({ jobDescription, cv, language });
      const session: SessionData = {
        jobDescription,
        cv,
        language,
        questions: data.questions,
        answers: data.questions.map(() => null),
      };
      saveSession(session);
      router.push("/session");
    } catch {
      setError({ message: "Could not reach the local server. Is the app still running?" });
    } finally {
      setGenerating(false);
    }
  }

  const aiReady = health?.ollama && health.hasModel;

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <Navbar />
      <main id="main" className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Set up the practice session
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
          Everything below stays on this laptop: the job description, the CV, the recordings, the
          scores.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <form
            className="flex flex-col gap-6 lg:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              if (!generating) void generate();
            }}
          >
            <Field
              label="Job description"
              htmlFor="job"
              helper="Paste the whole posting. Responsibilities matter most for the questions."
              error={error && !error.code ? error.message : undefined}
            >
              <textarea
                id="job"
                autoFocus
                className={`${TEXTAREA_CLASS} min-h-[160px] resize-y`}
                placeholder="Responsibilities, requirements, the stack, the team..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={generating}
              />
            </Field>

            <Field
              label="Candidate CV bullets"
              htmlFor="cv"
              helper="Short bullets are enough. The questions will pull from these."
            >
              <textarea
                id="cv"
                className={`${TEXTAREA_CLASS} min-h-[120px] resize-y`}
                placeholder="2 years support engineer... led the migration of..."
                value={cv}
                onChange={(e) => setCv(e.target.value)}
                disabled={generating}
              />
            </Field>

            <Field
              label="Interview language"
              helper="Questions, your answers, and the coach's tips all use this language."
            >
              <div className="flex gap-2" role="group" aria-label="Interview language">
                {(
                  [
                    ["en", "English"],
                    ["id", "Bahasa Indonesia"],
                  ] as [Language, string][]
                ).map(([code, label]) => {
                  const active = language === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setLanguage(code)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "border-ink bg-ink text-white"
                          : "border-hairline text-slate hover:bg-surface"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>

            {error?.code && (
              <p role="alert" className="rounded-md bg-tint-rose px-3 py-2 text-sm text-charcoal">
                {error.message}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={generating || !aiReady}>
                {generating ? (
                  <>
                    Asking Gemma for questions
                    <span aria-hidden className="animate-pulse">
                      ...
                    </span>
                  </>
                ) : (
                  "Generate my interview questions"
                )}
              </Button>
              {!aiReady && (
                <p className="text-[13px] text-steel">
                  Finish the local AI checklist first, then this unlocks.
                </p>
              )}
            </div>
            {generating && (
              <p className="text-[13px] leading-snug text-steel" aria-live="polite">
                First generation on a laptop CPU can take up to a minute. Later ones are faster
                because the model stays in memory.
              </p>
            )}
          </form>

          <aside className="flex flex-col gap-6 lg:col-span-5">
            <LocalAiPanel health={health} onRetry={() => void checkHealth()} retrying={checking} />

            <section className="rounded-lg border border-hairline bg-surface p-6">
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                Where your answers go
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {[
                  "Transcription runs inside this app on this machine.",
                  "Scoring runs in Ollama on this machine.",
                  "Recordings stay in the browser tab's memory and are never written anywhere.",
                  "Answers and scores are stored in this browser's local storage. Clear it and they are gone.",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-charcoal">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
