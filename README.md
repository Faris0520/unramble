# Unramble

A practice partner for real job interviews that runs entirely on your laptop.

Unramble was built for one real person: a friend preparing for interviews whose answers know
all the facts but fall apart in the telling. You speak an answer out loud, and the app shows
the structure behind it: which sentence set the scene, which one carried the action, where
you drifted into filler. Then Gemma rewrites the answer, straight.

**Everything is local.** Questions and scores come from Gemma 3 4B through Ollama.
Transcription comes from Whisper through transformers.js, inside the app's own server.
Recordings live in browser tab memory and are never written anywhere. There is no server to
upload to, so an interview rehearsal stays as private as it should be.

## Quick start

One-time setup (details in [SETUP.md](./SETUP.md)):

```
winget install Ollama.Ollama
ollama pull gemma3:4b
```

Then:

```
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). The setup page shows a live checklist of
the local AI pieces and unlocks when they are ready.

## How it works

1. **Setup**: paste a job description and a few CV bullets, pick the interview language
   (English or Bahasa Indonesia). Gemma writes 7 personalized questions.
2. **Session**: answer each question out loud. The browser decodes and resamples the
   recording, and local Whisper transcribes it. You can fix any misheard word before scoring.
3. **Feedback**: every sentence gets a color by role (Situation, Task, Action, Result, filler,
   off-topic), plus relevance and conciseness scores, STAR coverage chips, a computed
   "tangled" meter, and a rewritten, straighter version of your answer. Any question can be
   re-answered and rescored on its own.

All numbers on the report are measured from your session: filler density, sentence length,
and the model's scores of your actual answers.

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- [Gemma 3 4B](https://ollama.com/library/gemma3) via [Ollama](https://ollama.com) for
  question generation and rubric scoring (structured JSON output)
- [Whisper](https://huggingface.co/Xenova/whisper-base) via
  [@huggingface/transformers](https://huggingface.co/docs/transformers.js) for local
  speech-to-text
- Local metrics (filler counting, sentence splitting, tangled score) are computed in the app
  and never involve a network call

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama endpoint |
| `OLLAMA_MODEL` | `gemma3:4b` | Model tag used for generation and scoring |
| `WHISPER_MODEL` | `Xenova/whisper-base` | Transcription model; `whisper-small` is better for Indonesian |

## Notes

- Built for the DEV Hacktoberfest Weekend challenge, October 2026: "Build for a Friend",
  with open-source AI at its core.
- The first recording downloads Whisper weights once; the first question generation warms
  Gemma. After that, disconnect the WiFi and everything still works.
