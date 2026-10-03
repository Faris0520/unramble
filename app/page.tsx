import { Navbar } from "@/components/Navbar";
import { ButtonLink } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
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

// Sticky-note dots and thin mesh lines: the hero decoration documented in
// design.md, kept subtle and clipped to the navy band.
const DOTS = [
  { left: "9%", top: "20%", size: 12, color: "bg-tint-mint" },
  { left: "17%", top: "62%", size: 8, color: "bg-tint-rose" },
  { left: "27%", top: "34%", size: 10, color: "bg-tint-sky" },
  { left: "44%", top: "12%", size: 8, color: "bg-tint-lavender" },
  { left: "58%", top: "70%", size: 9, color: "bg-tint-peach" },
  { left: "74%", top: "24%", size: 12, color: "bg-tint-yellow" },
  { left: "84%", top: "56%", size: 8, color: "bg-tint-mint" },
  { left: "91%", top: "34%", size: 10, color: "bg-tint-rose" },
];

export default function LandingPage() {
  return (
    <main id="main">
      <Navbar />

      {/* Hero: navy band with the product mockup breaking out of its bottom edge */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-navy">
          <svg
            className="absolute right-0 top-0 h-full w-full text-white/10"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M900 40 C 760 160, 1040 240, 920 380 S 640 520, 760 660" stroke="currentColor" strokeWidth="1" />
            <path d="M1050 120 C 940 220, 1180 320, 1060 460 S 820 600, 940 740" stroke="currentColor" strokeWidth="1" />
            <path d="M120 640 C 240 560, 180 440, 320 400 S 480 320, 440 200" stroke="currentColor" strokeWidth="1" />
            <circle cx="920" cy="380" r="3" fill="currentColor" />
            <circle cx="1060" cy="460" r="3" fill="currentColor" />
            <circle cx="320" cy="400" r="3" fill="currentColor" />
          </svg>
          {DOTS.map((d, i) => (
            <span
              key={i}
              className={`absolute rounded-full ${d.color}`}
              style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center md:px-6 md:pb-24 md:pt-24">
          <p className="hero-rise text-sm font-medium text-white/70">
            A practice partner for job interviews
          </p>
          <h1
            className="hero-rise mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Your answers,
            <br />
            untangled
          </h1>
          <p
            className="hero-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80 text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            Speak your answer out loud, and Unramble shows the structure behind it: what set the
            scene, what you actually did, where you drifted. It runs entirely on your laptop.
          </p>
          <div
            className="hero-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <ButtonLink href="/setup" className="w-full sm:w-auto">
              Set up a practice session
            </ButtonLink>
            <ButtonLink href="#example" variant="on-dark" className="w-full sm:w-auto">
              See example feedback
            </ButtonLink>
          </div>
          <p
            className="hero-rise mt-6 text-[13px] leading-snug text-white/70"
            style={{ animationDelay: "320ms" }}
          >
            Free to run. One-time setup: Ollama with Gemma 3 4B. The checklist waits on the next
            screen.
          </p>

          {/* The example report, inside the navy band with air below it */}
          <div
            id="example"
            className="hero-rise relative z-10 mx-auto mt-16 max-w-4xl scroll-mt-24 text-left"
            style={{ animationDelay: "400ms" }}
          >
            <p className="mb-3 text-center text-[13px] font-medium text-white/70">
              Example feedback from a practice interview for a product manager role
            </p>
            <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-[0_24px_48px_-8px_rgba(15,15,15,0.2)] md:p-8">
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

              <h2 className="mt-8 text-xl font-semibold leading-snug text-ink">
                “Tell me about a time a launch was slipping. What did you do?”
              </h2>

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
                  “Checkout conversion dropped for two sprints. I owned finding the cause before
                  the holiday release, traced the funnel with payments, and isolated a card-retry
                  loop. We fixed it in three days and conversion recovered.”
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate">
                <span className="font-semibold text-charcoal">Coach’s tip: </span>
                Cut the opening hedges and land the result number first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What runs locally: hairline rows, not an icon grid */}
      <section id="local" className="bg-canvas pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            What runs on the laptop
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
            Three local pieces do all the work. That is the whole point: an interview rehearsal is
            private, and it should stay on your machine.
          </p>

          <dl className="mt-10">
            {LOCAL_ROWS.map((row, i) => (
              <Reveal key={row.name} delay={i * 80}>
                <div className="grid grid-cols-1 gap-2 border-t border-hairline py-6 md:grid-cols-12 md:gap-6">
                  <dt className="text-base font-semibold text-ink md:col-span-4">{row.name}</dt>
                  <dd className="text-base leading-relaxed text-slate text-pretty md:col-span-8">{row.desc}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <Reveal>
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                  Ready for your first take?
                </h2>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-slate text-pretty">
                  Paste a job description, add a few CV lines, and Gemma writes the questions.
                </p>
              </div>
              <ButtonLink href="/setup" className="shrink-0">
                Set up a practice session
              </ButtonLink>
            </div>
          </Reveal>
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
