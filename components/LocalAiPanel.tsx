"use client";

import { useState } from "react";
import { Button } from "./ui";

export interface HealthData {
  ollama: boolean;
  models: string[];
  hasModel: boolean;
  model: string;
  whisper: string;
}

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-sm bg-surface px-2 py-1">
      <code className="overflow-x-auto whitespace-nowrap font-mono text-[13px] text-charcoal">
        {command}
      </code>
      <button
        type="button"
        className="shrink-0 text-[13px] font-medium text-link hover:underline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

function StatusChip({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
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

  return (
    <section aria-label="Local AI setup checklist" className="rounded-lg border border-hairline bg-canvas p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Local AI checklist</h2>
          <p className="mt-1 text-[13px] leading-snug text-steel">
            One-time setup on this laptop. After this, everything works offline.
          </p>
        </div>
        <Button variant="secondary" onClick={onRetry} disabled={retrying} className="shrink-0">
          {retrying ? "Checking..." : "Check again"}
        </Button>
      </div>

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
          <StatusChip done={ollamaOk} label={ollamaOk ? "Running" : "To do"} />
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
          <StatusChip done={modelOk} label={modelOk ? "Ready" : "To do"} />
        </li>

        <li className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Whisper for transcription</p>
            <p className="mt-1 text-[13px] leading-snug text-steel">
              Nothing to install. Weights ({health?.whisper ?? "Xenova/whisper-base"}) download by
              themselves on your first recording, then stay in this project folder.
            </p>
          </div>
          <StatusChip done={false} label="Automatic" />
        </li>
      </ol>

      {health && health.ollama && health.models.length > 0 && (
        <p className="mt-3 text-[13px] text-steel">
          Detected models: {health.models.join(", ")}
        </p>
      )}
    </section>
  );
}
