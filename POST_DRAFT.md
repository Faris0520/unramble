<!--
DEV POST DRAFT (for the challenge submission, English is required for prizes)

Before publishing, fill in every [FILL: ...] marker with real information:
1. The friend's real first name (or the name they want published), their real role/industry,
   and your real relationship to them. Do not invent details.
2. Code block: the {% github %} tag below already points to Faris0520/unramble. Create the
   GitHub repo under exactly that name and push: git remote add origin
   https://github.com/Faris0520/unramble.git && git push -u origin main
3. Demo: upload the walkthrough to YouTube (unlisted is fine) and replace VIDEO_ID in the
   {% youtube %} tag. Recording script that covers the whole story in 60-90 seconds:
   hero with the example report -> setup page with the local AI checklist -> paste a job
   description -> questions generated -> one spoken take (WiFi icon visible!) -> the
   color-coded report -> a re-drill of the weakest question -> disconnect WiFi, record again.
4. Cover image suggestion: the landing hero with the example feedback card breaking out of
   the navy band. Second choice: the full-screen report view.
5. The handover section must be their actual reaction. Do NOT publish it until you have real
   words (and their permission to quote). Delete the section if they prefer not to be quoted.
6. Optional: save your agent session with DevRelay and embed it via the agent_session tag.
7. Tags: devchallenge, weekendchallenge, hf26challenge. Prize category listed at the bottom.

Everything between the markers below is the post body.
-->

# I built my friend a job-interview practice partner that never leaves her laptop

## What I Built

My friend [FILL: name] has a problem I recognized because I have it too. She knows her stuff.
Ask her about a project she shipped and, on paper, the answer is all there. But ask her out
loud, in an interview, and the answer wanders: it starts three digressions deep, never lands
the result, and buries the one sentence that mattered somewhere in the middle. She is not a
weak candidate. She is an unpracticed one, and practice is exactly the thing she cannot do,
because practicing means saying half-finished answers out loud to another human, at night,
repeatedly, until it stops being embarrassing.

So I built her **Unramble**: a practice partner for real interviews that runs entirely on her
laptop. She pastes a job description and a few CV bullets. Gemma 3, running locally through
Ollama, writes seven interview questions tuned to that role. She answers out loud, into the
microphone. Whisper, running locally inside the app's own server, transcribes her. And then
the part she actually needed: the report.

Every sentence of her answer gets a color that says what job it was doing: blue set the
Situation, purple named the Task, green carried the Action, yellow landed the Result. Gray is
filler. She can literally watch an answer go green, green, gray, gray, gray, and never reach
yellow. Below the transcript: relevance and conciseness scores, STAR coverage, a "tangled"
meter computed from measured filler density and sentence length, and a rewritten version of
her own answer with the detours removed, keeping only her real facts. Any question can be
re-answered on its own and rescored, so the weak one gets drilled until it stops being weak.

One rule shaped the whole build: nothing she says ever leaves her laptop. The recordings live
in browser tab memory and are never written anywhere. The transcript, the scores, the
report: all in local storage. The models run on her machine. There is no server to upload to.

## Demo

{% youtube VIDEO_ID %}

[FILL: one short paragraph describing what the video shows, including the offline moment if
you recorded it. A take recorded with the WiFi off tells the whole story by itself.]

## Code

{% github Faris0520/unramble %}

## How I Built It

Three open-source pieces, glued together as one local pipeline:

- **Question generation and scoring: Gemma 3 4B via Ollama.** The app talks to Ollama's local
  REST API with structured output (a JSON schema Ollama enforces), which is how a 4B model
  stays reliable: generation returns exactly `{ questions: string[7] }`, and scoring returns
  sentence tags plus integer scores, every time, on a laptop CPU. The model tag is one
  environment variable, so she can swap in a bigger Gemma when her hardware allows.
- **Transcription: Whisper via transformers.js.** The browser records the take, decodes it
  with its own AudioContext, mixes to mono, resamples to 16 kHz, and hands the app's server a
  plain PCM WAV. The server runs the quantized Whisper model in-process; the weights download
  once into the project folder and work offline from then on. For Indonesian answers, an
  environment variable switches to the small model, which hears the language better.
- **The metrics that do not need a model at all.** Filler counting, sentence splitting, and
  the tangled score are computed in plain TypeScript from her actual answer. A model judges
  structure; the app measures facts. The report never shows a number that was not measured.

Two details I am proud of. First, the transcript is editable before scoring: if Whisper
misheard a word, she fixes it, and the score is computed on what she approved, not on what
the machine guessed. Second, the on-screen checklist: the setup page pings Ollama, sees
exactly which local piece is missing, and prints the one command that fixes it. A friend who
has never opened a terminal gets the terminal command with a Copy button.

The interface follows Notion's design system, on purpose: a report about your weakest answer
should read like a calm document, not a dashboard. Pastel tints carry the sentence structure,
purple is reserved for the one action per screen, and the same layout works on a phone,
because practice happens wherever the laptop opens.

## Why Does Open Innovation Matter

An interview rehearsal is the most private thing a job seeker does. You say half-finished
sentences. You forget words you know. You ramble, and you know you are rambling while it is
happening. Nobody would want a recording of that on somebody else's server.

That is the argument for open, local AI in this specific product, and it is not a technical
argument, it is a dignity argument. With a closed API:

- her voice and her weakest answers would sit in someone else's cloud, on someone else's
  retention policy;
- every practice rep would cost money, and the whole point of practice is unlimited reps;
- it would need the internet, and the moment she most wants to practice is 2 AM before a
  morning interview, when she just needs the thing to work.

With the open stack, the privacy story is inspectable instead of promised. The Ollama process
runs on her machine, on a port she can see. The model weights sit in a folder she owns. If
she wanted, she could read every line that touches her voice. And because the core is open,
the app can grow with her: swap the model when a better open one lands, fine-tune on her own
practice answers someday, run it forever at zero cost on hardware she already owns.

Open innovation also meant *I* could build this in a weekend and hand it to one specific
person, with no API budget, no accounts, and no server to maintain. The tool exists because
one real friend needed it, and it can keep existing on her laptop whether or not I ever touch
it again.

## Handing it over

[FILL: This section is the bonus, and it must be real. Install it on her actual laptop, sit
next to her for her first take, and write what actually happened: what she said, what the
report showed about her real answer, what she drilled next. Quote her only with permission.
Delete this reminder before publishing.]

## My Agent Session

[FILL, optional: save your agent session with DevRelay and embed it here with the
agent_session tag, so judges can see the build process.]

## Prize Categories

- Gemma

---

*Unramble was built for the DEV Hacktoberfest Weekend challenge, October 2026. Thanks to the
open-source projects it stands on: Gemma, Ollama, Whisper, and transformers.js.*
