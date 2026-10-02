# Local AI setup guide

Unramble runs everything on your laptop. Three local pieces do the work, and each one needs a
one-time setup. After that, the whole app works with the WiFi turned off.

## What runs locally

| Piece | What it does | Where it lives |
| --- | --- | --- |
| Ollama + Gemma 3 4B | Generates the interview questions and scores every answer | A local Ollama service on port 11434 |
| Whisper (Xenova/whisper-base) | Turns your recorded voice into text | Weights download into `./.models` inside this project |
| Your browser's microphone | Records the take, decodes and resamples it to 16 kHz WAV | Nothing is saved; the recording stays in tab memory |

Nothing is uploaded anywhere. There is no server to upload to.

## One-time setup on your machine

### 1. Install Ollama

Download the installer from [ollama.com/download](https://ollama.com/download), or on Windows:

```
winget install Ollama.Ollama
```

After installing, Ollama runs as a background service. You can check it is alive by opening
[http://127.0.0.1:11434](http://127.0.0.1:11434) in a browser: it should answer with
`Ollama is running`.

### 2. Pull the Gemma 3 4B model

In any terminal:

```
ollama pull gemma3:4b
```

This downloads about 3.3 GB, once. Check that it arrived:

```
ollama list
```

You should see `gemma3:4b` in the list.

### 3. Install the app dependencies and start it

In this project folder:

```
npm install
npm run build
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

The setup page shows a live checklist of the two steps above. When both show a green state,
the "Generate my interview questions" button unlocks. If you skip ahead, the app detects
exactly what is missing and says so.

## First run behavior

- **First recording:** the app downloads the Whisper weights (about 40 MB for the quantized
  base model) into `./.models`. The page says so while it happens. Every later recording is
  fully offline.
- **First question generation:** Gemma loads into memory, which takes up to a minute on a
  laptop CPU. Later requests are much faster because the model stays warm.

## Going offline on purpose

The demo worth recording: run a full session, then disconnect the WiFi and run another one.
Questions, transcription, and scores all keep working. The only thing that ever needed the
network was the one-time model download.

## Handing this to a friend

On their Windows laptop:

1. Install Ollama and pull the model (steps 1 and 2 above), or double-click `unramble.bat`
   after installing Node.js and Ollama; it checks both and prints what is missing.
2. Copy this folder (or clone the repo), then run `unramble.bat`, or:
   ```
   npm install
   npm run build
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000). The on-screen checklist guides the rest.

## Configuration (optional)

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Where Ollama listens |
| `OLLAMA_MODEL` | `gemma3:4b` | Any Ollama model tag; larger Gemma 3 sizes score more accurately if the laptop can carry them |
| `WHISPER_MODEL` | `Xenova/whisper-base` | `Xenova/whisper-small` (~250 MB) transcribes Indonesian noticeably better on slower CPUs |

## Troubleshooting

- **"Ollama is not reachable"**: Ollama is not running. Start the Ollama app, or run
  `ollama serve`. The setup page's "Check again" button re-tests without a reload.
- **"The model gemma3:4b is not pulled yet"**: run `ollama pull gemma3:4b`.
- **Transcription fails on the first take**: the Whisper download was interrupted. Reload the
  page and record again; it resumes.
- **Answers transcribe with wrong words in Indonesian**: switch `WHISPER_MODEL` to
  `Xenova/whisper-small` and rebuild. You can also fix any misheard word directly in the
  transcript box before scoring; the score always uses what you approved.
- **Scoring is slow**: a 4B model on a CPU takes roughly a minute per answer. That is normal
  on laptops without a discrete GPU.
