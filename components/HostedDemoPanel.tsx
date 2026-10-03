import { CopyCommand } from "./LocalAiPanel";

// Shown instead of the local AI checklist when the app is a hosted preview.
// A hosted copy has no Ollama or Whisper on the server, so the honest message
// is "run the real thing on your laptop", not a checklist that can never pass.
export function HostedDemoPanel() {
  return (
    <section
      aria-label="Hosted preview notice"
      className="rounded-lg border border-hairline bg-tint-yellow p-6"
    >
      <h2 className="text-lg font-semibold tracking-tight text-ink">This is a hosted preview</h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal">
        Unramble is built to run on one laptop, and this hosted copy carries no local AI: it
        cannot generate questions, transcribe your voice, or score answers. The real thing takes
        a few minutes to set up on your own machine:
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        <li className="text-sm leading-relaxed text-charcoal">
          <span className="font-semibold">1. Install Ollama</span> from{" "}
          <a
            href="https://ollama.com/download"
            target="_blank"
            rel="noreferrer"
            className="text-link hover:underline"
          >
            ollama.com/download
          </a>
        </li>
        <li className="text-sm leading-relaxed text-charcoal">
          <span className="font-semibold">2. Pull the model</span> (about 3.3 GB, once):
          <div className="mt-1.5">
            <CopyCommand command="ollama pull gemma3:4b" />
          </div>
        </li>
        <li className="text-sm leading-relaxed text-charcoal">
          <span className="font-semibold">3. Run the app</span> from the repo folder:
          <div className="mt-1.5">
            <CopyCommand command="git clone https://github.com/faris0520/unramble && cd unramble" />
          </div>
          <div className="mt-1.5">
            <CopyCommand command="npm install && npm run build && npm start" />
          </div>
        </li>
      </ol>
      <p className="mt-4 text-[13px] leading-snug text-steel">
        Full details, including handing it to a friend, are in SETUP.md in the repository.
      </p>
    </section>
  );
}
