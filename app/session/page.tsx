"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Microphone, Stop, ArrowClockwise, Check } from "@phosphor-icons/react";
import { Button, ButtonLink, Header } from "@/components/ui";
import { blobToWav16k } from "@/lib/audio";
import { loadSession, saveSession, loadReport, saveReport } from "@/lib/session";
import { buildOverall } from "@/lib/report";
import type { FeedbackReport, PracticeAnswer, ScoredAnswer, SessionData } from "@/lib/types";

type QState = "idle" | "recording" | "decoding" | "transcribing" | "review";

function formatTime(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function SessionPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<"loading" | "empty" | "ready" | "alldone">("loading");
  const [session, setSession] = useState<SessionData | null>(null);
  const [idx, setIdx] = useState(0);
  const [qState, setQState] = useState<QState>("idle");
  const [transcript, setTranscript] = useState("");
  const [typedMode, setTypedMode] = useState(false);
  const [usedMic, setUsedMic] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [ollamaDown, setOllamaDown] = useState(false);
  const [drillIndex, setDrillIndex] = useState<number | null>(null);
  const [scoring, setScoring] = useState<{
    active: boolean;
    done: number;
    total: number;
    failedAt: number | null;
    error: string | null;
  }>({ active: false, done: 0, total: 0, failedAt: null, error: null });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loaded = loadSession();
    if (!loaded || loaded.questions.length === 0) {
      setPhase("empty");
      return;
    }
    setSession(loaded);

    const drillParam = new URLSearchParams(window.location.search).get("drill");
    if (drillParam !== null) {
      const d = Number(drillParam);
      const report = loadReport();
      const previous = report?.answers.find((a) => a.questionIndex === d);
      if (report && previous && d >= 0 && d < loaded.questions.length) {
        setDrillIndex(d);
        setIdx(d);
        setTranscript(previous.transcript);
        setUsedMic(!previous.typed);
        setQState("review");
        setPhase("ready");
        return;
      }
    }

    const firstOpen = loaded.answers.findIndex((a) => a === null);
    setIdx(firstOpen === -1 ? 0 : firstOpen);

    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((h: { ollama: boolean; hasModel: boolean }) => {
        setOllamaDown(!(h.ollama && h.hasModel));
      })
      .catch(() => setOllamaDown(true));

    setPhase("ready");
  }, []);

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => cleanupRecording, [cleanupRecording]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  async function startRecording() {
    setMicError(null);
    setTranscript("");
    setUsedMic(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : undefined;
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => void handleStop();
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setQState("recording");
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setMicError("Microphone access was blocked. Allow it in the browser, or type the answer instead.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setMicError("No microphone was found on this machine. Type the answer instead.");
      } else {
        setMicError("The microphone could not start. Type the answer instead.");
      }
      setQState("idle");
    }
  }

  async function handleStop() {
    const mimeType = recorderRef.current?.mimeType ?? "audio/webm";
    cleanupRecording();
    const blob = new Blob(chunksRef.current, { type: mimeType });
    if (blob.size < 2000) {
      setMicError("That take was too short. Hold the answer for at least a few seconds.");
      setQState("idle");
      return;
    }
    try {
      setQState("decoding");
      const wav = await blobToWav16k(blob);
      setQState("transcribing");
      const language = session?.language ?? "en";
      const res = await fetch(`/api/transcribe?lang=${language}`, {
        method: "POST",
        body: wav,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setMicError(data.error ?? "Local transcription failed.");
        setQState("idle");
        return;
      }
      if (!data.text?.trim()) {
        setMicError("Nothing audible came back from transcription. Try again, closer to the mic.");
        setQState("idle");
        return;
      }
      setTranscript(data.text);
      setUsedMic(true);
      setQState("review");
    } catch {
      setMicError("Local transcription failed. You can type the answer instead.");
      setQState("idle");
    }
  }

  function resetTake() {
    setTranscript("");
    setSeconds(0);
    setMicError(null);
    setUsedMic(false);
    setQState("idle");
  }

  function lockAnswer() {
    if (!session) return;
    const text = transcript.trim();
    if (!text) return;
    const answer: PracticeAnswer = {
      question: session.questions[idx],
      transcript: text,
      seconds,
      typed: !usedMic,
    };

    if (drillIndex !== null) {
      void rescoreOne(answer);
      return;
    }

    const answers = session.answers.slice();
    answers[idx] = answer;
    const updated = { ...session, answers };
    setSession(updated);
    saveSession(updated);

    const nextOpen = answers.findIndex((a, i) => a === null && i > idx);
    if (nextOpen !== -1) {
      setIdx(nextOpen);
      resetTake();
      setTypedMode(false);
    } else {
      setPhase("alldone");
    }
  }

  async function scoreAnswer(answer: PracticeAnswer, questionIndex: number): Promise<ScoredAnswer> {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: session?.language ?? "en", questionIndex, ...answer }),
    });
    const data = (await res.json()) as { scored?: ScoredAnswer; error?: string; code?: string };
    if (!res.ok || !data.scored) {
      throw new Error(data.error ?? "Scoring failed.");
    }
    return data.scored;
  }

  async function rescoreOne(answer: PracticeAnswer) {
    if (!session) return;
    setScoring({ active: true, done: 0, total: 1, failedAt: null, error: null });
    try {
      const scored = await scoreAnswer(answer, drillIndex ?? idx);
      const report = loadReport();
      if (!report) throw new Error("The previous report went missing. Run the full session again.");
      const merged = report.answers.filter((a) => a.questionIndex !== scored.questionIndex);
      merged.push(scored);
      merged.sort((a, b) => a.questionIndex - b.questionIndex);
      const updated: FeedbackReport = {
        ...report,
        answers: merged,
        answeredCount: merged.length,
        overall: buildOverall(merged, report.totalCount),
      };
      saveReport(updated);
      router.push("/feedback");
    } catch (err) {
      setScoring({
        active: false,
        done: 0,
        total: 1,
        failedAt: drillIndex ?? idx,
        error: err instanceof Error ? err.message : "Scoring failed.",
      });
    }
  }

  async function scoreSession(startFrom = 0) {
    if (!session) return;
    const indices: number[] = [];
    session.answers.forEach((a, i) => {
      if (a) indices.push(i);
    });
    const todo = indices.filter((i) => i >= startFrom);
    setScoring({ active: true, done: indices.length - todo.length, total: indices.length, failedAt: null, error: null });

    const results: ScoredAnswer[] = [];
    for (let n = 0; n < todo.length; n++) {
      const i = todo[n];
      try {
        results.push(await scoreAnswer(session.answers[i] as PracticeAnswer, i));
        setScoring((s) => ({ ...s, done: s.done + 1 }));
      } catch (err) {
        setScoring((s) => ({
          ...s,
          failedAt: i,
          error: err instanceof Error ? err.message : "Scoring failed.",
        }));
        return;
      }
    }

    const report: FeedbackReport = {
      createdAt: new Date().toISOString(),
      language: session.language,
      answeredCount: indices.length,
      totalCount: session.questions.length,
      answers: results,
      overall: buildOverall(results, session.questions.length),
    };
    saveReport(report);
    router.push("/feedback");
  }

  if (phase === "loading") {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <Header />
        <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-steel md:px-6">Loading session...</p>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mx-auto max-w-md rounded-lg border border-hairline bg-canvas p-8 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-ink">No active session</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Set up a session first: paste a job description and a few CV bullets, then the
              questions appear here.
            </p>
            <ButtonLink href="/setup" className="mt-6">
              Start from setup
            </ButtonLink>
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;

  const answeredCount = session.answers.filter(Boolean).length;
  const total = session.questions.length;

  if (scoring.active || scoring.error) {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 md:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Scoring locally</h1>
          <p className="mt-3 text-base leading-relaxed text-slate">
            Gemma reads every answer and tags its sentences. This takes about a minute per answer
            on a laptop CPU.
          </p>
          <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-300"
              style={{ transform: `scaleX(${scoring.total ? scoring.done / scoring.total : 0})` }}
            />
          </div>
          <p className="mt-3 text-[13px] text-steel" aria-live="polite">
            Answer {Math.min(scoring.done + 1, scoring.total)} of {scoring.total}
          </p>
          {scoring.error && (
            <div className="mt-8 rounded-lg border border-hairline bg-tint-rose p-6">
              <p className="text-sm font-semibold text-charcoal">
                Scoring stopped at answer {(scoring.failedAt ?? 0) + 1}.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal">{scoring.error}</p>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => void scoreSession(scoring.failedAt ?? 0)}>
                  Retry from there
                </Button>
                <Button variant="ghost" onClick={() => setScoring({ active: false, done: 0, total: 0, failedAt: null, error: null })}>
                  Back to session
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (phase === "alldone") {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 md:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">All questions answered</h1>
          <p className="mt-3 text-base leading-relaxed text-slate">
            {total} takes recorded. Gemma will score each one: sentence tags, STAR coverage, and a
            straighter rewrite. Nothing leaves this machine while it works.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => void scoreSession()}>Score {total} answers</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIdx(0);
                resetTake();
                setTypedMode(false);
                setPhase("ready");
              }}
            >
              Review the takes first
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const question = session.questions[idx];
  const busy = qState === "decoding" || qState === "transcribing";

  return (
    <div className="min-h-[100dvh] bg-canvas">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        {drillIndex !== null && (
          <div className="mb-8 rounded-lg border border-hairline bg-tint-yellow p-4">
            <p className="text-sm leading-relaxed text-charcoal">
              Re-answer mode. Your new take replaces the old one in the report.
            </p>
            <ButtonLink href="/feedback" variant="ghost" className="mt-2 px-2 py-1">
              Cancel and go back to the report
            </ButtonLink>
          </div>
        )}

        {ollamaDown && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-tint-yellow p-4">
            <p className="text-sm leading-relaxed text-charcoal">
              Ollama is not ready, so scoring is offline. You can still practice and record takes.
            </p>
            <ButtonLink href="/setup" variant="secondary" className="shrink-0">
              Open the checklist
            </ButtonLink>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] font-semibold text-steel">
            Question {idx + 1} of {total}
          </p>
          {answeredCount > 0 && answeredCount < total && drillIndex === null && (
            <Button variant="ghost" className="px-2 py-1" onClick={() => void scoreSession()}>
              Finish with the answered ones
            </Button>
          )}
        </div>

        <div className="mt-3 flex gap-1.5" aria-hidden>
          {session.questions.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                session.answers[i] ? "bg-ink" : i === idx ? "bg-primary" : "bg-hairline"
              }`}
            />
          ))}
        </div>

        <h1 className="mt-8 text-2xl font-semibold leading-snug tracking-tight text-ink md:text-3xl">
          {question}
        </h1>

        {qState === "idle" && (
          <div className="mt-8">
            {micError && (
              <p role="alert" className="mb-4 rounded-md bg-tint-rose px-3 py-2 text-sm text-charcoal">
                {micError}
              </p>
            )}
            {typedMode ? (
              <div className="flex flex-col gap-4">
                <textarea
                  className="min-h-[160px] w-full resize-y rounded-md border border-hairline-strong bg-canvas px-3 py-2.5 text-base leading-relaxed text-ink placeholder:text-stone transition-colors focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Type the answer the way you would say it out loud..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={lockAnswer} disabled={!transcript.trim()}>
                    Lock in this answer
                  </Button>
                  <Button variant="ghost" onClick={() => setTypedMode(false)}>
                    Use the microphone instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <Button variant="dark" onClick={() => void startRecording()} className="px-6 py-4 text-base">
                  <Microphone size={20} weight="fill" aria-hidden />
                  Start answering out loud
                </Button>
                <Button variant="ghost" className="px-2 py-1" onClick={() => setTypedMode(true)}>
                  Or type it instead
                </Button>
                <p className="max-w-md text-[13px] leading-snug text-steel">
                  Speak for 30 to 90 seconds, the way you would in the room. The recording is
                  decoded in your browser and transcribed on this machine.
                </p>
              </div>
            )}
          </div>
        )}

        {(qState === "recording" || busy) && (
          <div className="mt-8 flex flex-col items-start gap-4">
            {qState === "recording" ? (
              <>
                <Button variant="dark" onClick={stopRecording} className="px-6 py-4 text-base">
                  <Stop size={20} weight="fill" aria-hidden />
                  Stop recording
                </Button>
                <p className="flex items-center gap-2 text-sm text-charcoal" aria-live="polite">
                  <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-error" />
                  Recording {formatTime(seconds)}
                </p>
              </>
            ) : (
              <>
                <div
                  aria-hidden
                  className="h-10 w-40 animate-pulse rounded-md bg-surface"
                />
                <p className="text-sm text-steel" aria-live="polite">
                  {qState === "decoding"
                    ? "Decoding the take in your browser..."
                    : "Transcribing on this machine. The first take downloads the Whisper model once."}
                </p>
              </>
            )}
          </div>
        )}

        {qState === "review" && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="transcript" className="text-sm font-medium text-ink">
                What the microphone heard. Fix any word before it gets scored.
              </label>
              <textarea
                id="transcript"
                className="min-h-[180px] w-full resize-y rounded-md border border-hairline-strong bg-canvas px-3 py-2.5 text-base leading-relaxed text-ink transition-colors focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={lockAnswer}>
                <Check size={18} aria-hidden />
                Lock in this answer
              </Button>
              <Button variant="ghost" onClick={resetTake}>
                <ArrowClockwise size={18} aria-hidden />
                Record again
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
