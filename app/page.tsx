import { ButtonLink, Wordmark } from "@/components/ui";
import { meterColor } from "@/lib/report";

const EXAMPLE_SENTENCES: { text: string; tag: string }[] = [
  { text: "Our mobile checkout conversion had dropped for two sprints straight.", tag: "situation" },
  { text: "My task was to find the cause before the holiday release.", tag: "task" },
  { text: "Umm, so basically I, I looked at the funnel data with the payments team.", tag: "filler" },
  { text: "I found that one failed card retry was looping users back to the cart.", tag: "action" },
  { text: "We shipped the fix in three days and conversion recovered to its previous level.", tag: "result" },
];

const TAG_STYLES: Record<string, string> = {
  situation: "bg-tint-sky",
  task: "bg-tint-lavender",
  action: "bg-tint-mint",
  result: "bg-tint-yellow",
  filler: "bg-tint-gray",
  offtopic: "bg-tint-rose",
};

const LOCAL_ROWS = [
  {
    name: "Gemma 3 4B, via Ollama",
    desc: "Generates your questions and scores every answer. It runs on this machine's CPU or GPU through Ollama, and swapping the model is one environment variable.",
  },
  {
    name: "Whisper, via transformers.js",
    desc: "Turns your voice into text on the spot. The weights download once into the project folder and keep working with the WiFi off.",
  },
  {
    name: "Your browser's microphone",
    desc: "Records the take, decodes and resamples it locally, then lets it go. There is no server to upload to.",
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* Hero band: navy with the brand's sticky-note dots, per design.md */}
      <section className="relative overflow-hidden bg-navy">
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          <span className="absolute left-[12%] top-[22%] h-3 w-3 rounded-full bg-tint-mint" />
          <span className="absolute left-[20%] top-[64%] h-2 w-2 rounded-full bg-tint-rose" />
          <span className="absolute right-[14%] top-[30%] h-2.5 w-2.5 rounded-full bg-tint-yellow" />
          <span className="absolute right-[22%] top-[70%] h-3 w-3 rounded-full bg-tint-sky" />
          <span className="absolute left-[48%] top-[14%] h-2 w-2 rounded-full bg-tint-lavender" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center md:px-6 md:py-32">
          <Wordmark tone="dark" />
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-[56px] md:leading-[1.1]">
            Your answers, untangled
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#a4a097]">
            Unramble is a practice partner for real job interviews. Speak your answer out loud, and
            it shows the structure behind it: what set the scene, what you actually did, where you
            drifted. It runs entirely on your laptop.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <ButtonLink href="/setup" className="w-full sm:w-auto">
              Set up a practice session
            </ButtonLink>
            <ButtonLink href="#example" variant="on-dark" className="w-full sm:w-auto">
              See example feedback
            </ButtonLink>
          </div>
          <p className="mt-6 max-w-md text-[13px] leading-snug text-[#a4a097]">
            Free to run. One-time setup: Ollama with Gemma 3 4B. The checklist waits on the next
            screen.
          </p>
        </div>
      </section>

      {/* Example feedback, explicitly labeled as an example */}
      <section id="example" className="bg-surface-soft py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-steel">Example</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            The report after a take
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
            Sample feedback for a practice interview for a product manager role, so you know what
            you get before setup.
          </p>

          <div className="mt-8 rounded-lg border border-hairline bg-canvas p-6 shadow-[0_24px_48px_-8px_rgba(15,15,15,0.2)] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold tracking-tight text-ink">38</span>
                <span className="rounded-full bg-tint-yellow px-2.5 py-0.5 text-[13px] font-semibold text-charcoal">
                  A few detours
                </span>
              </div>
              <span className="text-[13px] text-steel">4 of 4 questions answered</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
              <div className={`h-full w-[38%] rounded-full ${meterColor(38)}`} />
            </div>

            <h3 className="mt-8 text-xl font-semibold leading-snug text-ink">
              “Tell me about a time a launch was slipping. What did you do?”
            </h3>

            <p className="mt-5 text-base leading-[1.9] text-charcoal">
              {EXAMPLE_SENTENCES.map((s, i) => (
                <span
                  key={i}
                  title={s.tag}
                  className={`mr-1.5 inline rounded-[4px] px-1.5 py-0.5 box-decoration-clone ${
                    TAG_STYLES[s.tag] ?? ""
                  }`}
                >
                  {s.text}
                </span>
              ))}
            </p>

            <p className="mt-4 text-[13px] text-steel">
              6 filler words in 96 words · Relevance 7/10 · Conciseness 6/10
            </p>

            <div className="mt-6 rounded-md bg-tint-mint p-4">
              <p className="text-[13px] font-semibold text-charcoal">A straighter version</p>
              <p className="mt-2 text-[15px] leading-relaxed text-charcoal">
                “Checkout conversion dropped for two sprints. I owned finding the cause before the
                holiday release, traced the funnel with payments, and isolated a card-retry loop.
                We fixed it in three days and conversion recovered.”
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate">
              <span className="font-semibold text-charcoal">Coach’s tip: </span>
              Cut the opening hedges and land the result number first.
            </p>
          </div>
        </div>
      </section>

      {/* What runs locally: hairline rows, not an icon grid */}
      <section id="local" className="bg-canvas py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            What runs on the laptop
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
            Three local pieces do all the work. That is the whole point: an interview rehearsal is
            private, and it should stay on your machine.
          </p>

          <dl className="mt-10">
            {LOCAL_ROWS.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-1 gap-2 border-t border-hairline py-6 md:grid-cols-12 md:gap-6"
              >
                <dt className="text-base font-semibold text-ink md:col-span-4">{row.name}</dt>
                <dd className="text-base leading-relaxed text-slate md:col-span-8">{row.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Ready for your first take?
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate">
              Paste a job description, add a few CV lines, and Gemma writes the questions.
            </p>
          </div>
          <ButtonLink href="/setup" className="shrink-0">
            Set up a practice session
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-hairline py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <p className="text-[13px] leading-snug text-steel">
            Built for the DEV Hacktoberfest Weekend challenge, October 2026. Questions, recordings,
            and scores never leave this machine.
          </p>
        </div>
      </footer>
    </main>
  );
}
