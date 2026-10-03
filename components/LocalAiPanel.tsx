"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";

export interface HealthData {
  ollama: boolean;
  models: string[];
  hasModel: boolean;
  model: string;
  whisper: string;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // The async clipboard can be blocked by permissions or embedding; fall
    // back to a hidden textarea and the legacy copy command.
    try {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(helper);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyCommand({ command }: { command: string }) {
  const codeRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  async function onCopy() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const ok = await copyText(command);
    if (ok) {
      setStatus("copied");
      timerRef.current = setTimeout(() => setStatus("idle"), 1600);
      return;
    }
    // Last resort: select the command text so Ctrl+C finishes the job.
    if (codeRef.current) {
      const selection = window.getSelection();
      if (selection) selection.selectAllChildren(codeRef.current);
    }
    setStatus("manual");
    timerRef.current = setTimeout(() => setStatus("idle"), 6000);
  }

  const label = status === "copied" ? "Copied" : status === "manual" ? "Press Ctrl+C" : "Copy";

  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-sm bg-surface px-2 py-1">
      <code
        ref={codeRef}
        className="overflow-x-auto whitespace-nowrap font-mono text-[13px] text-charcoal"
      >
        {command}
      </code>
      <button
        type="button"
        onClick={() => void onCopy()}
        className={`shrink-0 rounded-sm px-2 py-1 text-[13px] font-medium transition-[transform,color] duration-150 active:scale-[0.96] ${
          status === "idle"
            ? "text-link-pressed hover:underline"
            : status === "manual"
              ? "text-charcoal underline"
              : "text-charcoal"
        }`}
      >
        {label}
      </button>
    </span>
  );
}

function StatusChip({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`chip-check rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
        done ? "bg-tint-mint text-charcoal" : "bg-tint-gray text-charcoal"
      }`}
    >
      {label}
    </span>
  );
}

// The one-time local AI checklist. Rendered from a real health check of the
// machine, so every status line is measured, not claimed.
export function LocalAiPanel({
  health,
  onRetry,
  retrying,
}: {
  health: HealthData | null;
  onRetry: () => void;
  retrying?: boolean;
}) {
  const ollamaOk = health?.ollama ?? false;
  const modelOk = health?.hasModel ?? false;
  const model = health?.model ?? "gemma3:4b";
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const wasChecking = useRef(false);

  // Every completed check (the first load included) leaves a visible result.
  useEffect(() => {
    if (retrying) {
      wasChecking.current = true;
      return;
    }
    if (health && (wasChecking.current || checkedAt === null)) {
      wasChecking.current = false;
      setCheckedAt(new Date());
    }
  }, [retrying, health, checkedAt]);

  const checkSummary = !health
    ? null
    : !health.ollama
      ? "Ollama is not reachable yet."
      : !health.hasModel
        ? `Ollama is running, but ${health.model} is not pulled yet.`
        : "Everything is ready. You can start.";

  const flashKey = checkedAt?.getTime() ?? 0;

  return (
    <section
      aria-label="Local AI setup checklist"
      className="rounded-lg border border-hairline bg-canvas p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Local AI checklist</h2>
          <p className="mt-1 text-[13px] leading-snug text-steel">
            One-time setup on this laptop. After this, everything works offline.
          </p>
        </div>
        <Button variant="secondary" onClick={onRetry} disabled={retrying} className="shrink-0">
          {retrying ? (
            <>
              Checking
              <span aria-hidden className="animate-pulse">
                ...
              </span>
            </>
          ) : (
            "Check again"
          )}
        </Button>
      </div>

      {checkedAt && checkSummary && (
        <p
          aria-live="polite"
          className={`mt-4 rounded-md px-3 py-2 text-[13px] leading-snug text-charcoal tabular-nums ${
            ollamaOk && modelOk ? "bg-tint-mint" : "bg-tint-gray"
          }`}
        >
          Last checked at {checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
          {checkSummary}
        </p>
      )}

      <ol className="mt-5">
        <li className="flex items-center justify-between gap-3 border-b border-hairline-soft py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Ollama installed and running</p>
            <p className="mt-1 text-[13px] text-steel">
              Install from{" "}
              <a
                href="https://ollama.com/download"
                target="_blank"
                rel="noreferrer"
                className="text-link hover:underline"
              >
                ollama.com/download
              </a>{" "}
              or run:
            </p>
            <div className="mt-1.5">
              <CopyCommand command="winget install Ollama.Ollama" />
            </div>
          </div>
          <StatusChip key={`ollama-${flashKey}`} done={ollamaOk} label={ollamaOk ? "Running" : "To do"} />
        </li>

        <li className="flex items-center justify-between gap-3 border-b border-hairline-soft py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Pull the Gemma 3 model</p>
            <p className="mt-1 text-[13px] text-steel">
              About 3.3 GB, downloaded once by Ollama:
            </p>
            <div className="mt-1.5">
              <CopyCommand command={`ollama pull ${model}`} />
            </div>
          </div>
          <StatusChip key={`model-${flashKey}`} done={modelOk} label={modelOk ? "Ready" : "To do"} />
        </li>

        <li className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Whisper for transcription</p>
            <p className="mt-1 text-[13px] leading-snug text-steel">
              Nothing to install. Weights ({health?.whisper ?? "Xenova/whisper-base"}) download by
              themselves on your first recording, then stay in this project folder.
            </p>
          </div>
          <StatusChip key={`whisper-${flashKey}`} done={false} label="Automatic" />
        </li>
      </ol>

      {health && health.ollama && health.models.length > 0 && (
        <p className="mt-3 text-[13px] text-steel">Detected models: {health.models.join(", ")}</p>
      )}
    </section>
  );
}
