# Theatre Theatrics

A React + Vite app where the user watches a YouTube video while the AI watches them via webcam. After the video, the AI runs a live interview and produces a final emotional report.

**GitHub:** https://github.com/PRangsi1886/Homework-1

## Features (assignment rubric)

- **YouTube Video Metadata** — paste a URL to fetch title, duration (seconds), description, and transcript
- **Visual Evaluation** — webcam captures up to **20** reaction snapshots during playback; analyzed with **`gpt-5.6`**
- **The Interviewer** — post-video chatbot whose system prompt includes **visual evaluation** and **video metadata**
- **Final Synthesis** — end chat to generate a report integrating **chat history** with **visual/video data**
- **AI Grading Folder** — `ai_grading/` at repo root (see below)

## Setup

```bash
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
npm run dev
```

Open **http://localhost:5176** in your browser after `npm run dev`.

- **Frontend (the app):** http://localhost:5176
- **API (backend only):** http://localhost:3003

Optional: set `OPENAI_MODEL=gpt-5.6-luna` in `.env` (default is `gpt-5.6`).

## Flow

1. Paste a YouTube URL and click **Start Showtime**
2. Click **Start Watching** — allow webcam access
3. Click **Finish & Analyze** (or wait for the video to end)
4. Click **Begin Interview** to chat with Theatre Theatrics
5. Click **End Chat** to generate the final report

## AI grading folder

The `ai_grading/` folder at the repository root contains outputs from a valid test-video run:

| File | Description |
|------|-------------|
| `video_metadata.json` | Title, duration, description, transcript |
| `visual_evaluation.txt` | GPT visual evaluation of reaction captures |
| `final_prompt.txt` | Full prompt sent for final synthesis |
| `final_report.txt` | Generated final report |

Regenerate with:

```bash
node scripts/generate-ai-grading.mjs "https://www.youtube.com/watch?v=jNQXAC9IVRw"
```

Completing **End Chat** in the app also refreshes `ai_grading/` automatically.

## API endpoints

- `GET /api/health`
- `POST /api/youtube-metadata`
- `POST /api/visual-evaluation`
- `POST /api/interview`
- `POST /api/final-report`
