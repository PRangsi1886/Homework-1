/**
 * Generates ai_grading/ artifacts from a test YouTube URL using the live OpenAI API.
 * Usage: node scripts/generate-ai-grading.mjs [youtube-url]
 */
import 'dotenv/config'
import { fetchYouTubeMetadata } from '../server/youtube.js'
import { writeAiGradingArtifacts } from '../server/aiGrading.js'
import {
  buildVisionInput,
  createJsonResponse,
  createTextResponse,
  toResponseInputMessages,
} from '../server/openaiResponses.js'
import { FINAL_REPORT_SCHEMA, VISUAL_EVALUATION_SCHEMA } from '../server/jsonSchemas.js'

const MODEL = process.env.OPENAI_MODEL?.trim() || 'gpt-5.6-luna'
const TEST_URL =
  process.argv[2]?.trim() || 'https://www.youtube.com/watch?v=jNQXAC9IVRw'

const PLACEHOLDER_JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUQEhMWFhUXGBcYFxgXGBgVFRUXFhcVGBcYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLi0BCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGQB//Z'

async function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing from .env')
  const { default: OpenAI } = await import('openai')
  return new OpenAI({ apiKey })
}

function metadataBlock(metadata) {
  return `
Title: ${metadata.title}
Duration: ${metadata.duration}s
Description: ${metadata.description}
Transcript excerpt: ${(metadata.transcript ?? '').slice(0, 4000)}
`.trim()
}

function visualEvalBlock(evaluation) {
  const observations = (evaluation.observations ?? [])
    .map((o) => `- ${o.timestampLabel ?? o.timestamp}: ${o.expression} — ${o.interpretation}`)
    .join('\n')
  return `
Overall engagement: ${evaluation.overallEngagement ?? 'Unknown'}
Summary: ${evaluation.summary ?? ''}
Observations:
${observations || 'None recorded'}
`.trim()
}

function buildSyntheticFrames(duration) {
  const count = Math.min(20, Math.max(5, Math.floor(duration / 4) || 5))
  return Array.from({ length: count }, (_, i) => {
    const timestamp = Math.floor((duration / count) * i)
    const m = Math.floor(timestamp / 60)
    const s = timestamp % 60
    return {
      timestamp,
      timestampLabel: `${m}:${String(s).padStart(2, '0')}`,
      dataUrl: PLACEHOLDER_JPEG,
    }
  })
}

async function runVisualEvaluation(openai, metadata, frames) {
  const timestampList = frames
    .map((img) => `Image at ${img.timestampLabel} (${img.timestamp}s)`)
    .join('\n')

  const systemPrompt = `You analyze facial expressions and engagement while someone watches a video.`

  const userText = `Video being watched:\n${metadataBlock(metadata)}\n\nCapture timestamps:\n${timestampList}\n\nAnalyze these ${frames.length} webcam captures in order.`

  return createJsonResponse(openai, {
    model: MODEL,
    instructions: systemPrompt,
    input: buildVisionInput(userText, frames),
    schema: VISUAL_EVALUATION_SCHEMA,
    schemaName: 'visual_evaluation',
  })
}

async function runInterview(openai, metadata, visualEvaluation) {
  const systemPrompt = `You are Theatre Theatrics, a warm post-viewing interviewer.
VIDEO METADATA:
${metadataBlock(metadata)}

VISUAL EVALUATION:
${visualEvalBlock(visualEvaluation)}

Ask what they liked and disliked. Reference facial expressions at timestamps.`

  const messages = [
    { role: 'user', content: 'The video just ended. Please begin the interview.' },
  ]

  const first = await createTextResponse(openai, {
    model: MODEL,
    instructions: systemPrompt,
    input: toResponseInputMessages(messages),
  })
  messages.push({ role: 'assistant', content: first })
  messages.push({
    role: 'user',
    content:
      'I thought the video was interesting overall. The beginning caught my attention and I stayed engaged through the middle.',
  })

  const second = await createTextResponse(openai, {
    model: MODEL,
    instructions: systemPrompt,
    input: toResponseInputMessages(messages),
  })
  messages.push({ role: 'assistant', content: second })

  return messages
}

async function runFinalReport(openai, metadata, visualEvaluation, chatHistory) {
  const transcript = chatHistory
    .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'User'}: ${m.content}`)
    .join('\n\n')

  const systemContent = `You synthesize a final emotional viewing report styled like a movie review page.`

  const userContent = `VIDEO METADATA:
${metadataBlock(metadata)}

VISUAL EVALUATION:
${visualEvalBlock(visualEvaluation)}

INTERVIEW TRANSCRIPT:
${transcript}

Write the final synthesis report.`

  const report = await createJsonResponse(openai, {
    model: MODEL,
    instructions: systemContent,
    input: userContent,
    schema: FINAL_REPORT_SCHEMA,
    schemaName: 'final_report',
  })
  const finalPrompt = `MODEL: ${MODEL}\n\n=== SYSTEM ===\n${systemContent}\n\n=== USER ===\n${userContent}`

  return { report, finalPrompt }
}

async function main() {
  console.log(`Fetching metadata for ${TEST_URL}...`)
  const videoId = TEST_URL.match(/([a-zA-Z0-9_-]{11})/)?.[1]
  if (!videoId) throw new Error('Invalid YouTube URL')
  const metadata = await fetchYouTubeMetadata(videoId)

  const openai = await getOpenAI()
  const frames = buildSyntheticFrames(metadata.duration ?? 19)

  console.log(`Running visual evaluation (${frames.length} frames, model: ${MODEL})...`)
  const visualEvaluation = await runVisualEvaluation(openai, metadata, frames)

  console.log('Running sample interview...')
  const chatHistory = await runInterview(openai, metadata, visualEvaluation)

  console.log('Generating final report...')
  const { report, finalPrompt } = await runFinalReport(
    openai,
    metadata,
    visualEvaluation,
    chatHistory,
  )

  await writeAiGradingArtifacts({
    videoMetadata: metadata,
    visualEvaluation,
    finalPrompt,
    finalReport: report,
  })

  console.log('Wrote ai_grading/:')
  console.log('  - video_metadata.json')
  console.log('  - visual_evaluation.txt')
  console.log('  - final_prompt.txt')
  console.log('  - final_report.txt')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
