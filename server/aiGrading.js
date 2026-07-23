import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const GRADING_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ai_grading')

export function formatVisualEvaluationText(evaluation) {
  if (!evaluation) return 'No visual evaluation available.'
  if (typeof evaluation === 'string') return evaluation

  const observations = (evaluation.observations ?? [])
    .map(
      (o) =>
        `[${o.timestampLabel ?? o.timestamp ?? '?'}] ${o.expression}\n  ${o.interpretation}`,
    )
    .join('\n\n')

  return [
    `Reaction score: ${evaluation.reactionScore ?? 'n/a'}/100`,
    `Overall engagement: ${evaluation.overallEngagement ?? 'Unknown'}`,
    '',
    'Summary:',
    evaluation.summary ?? '',
    '',
    'Observations:',
    observations || 'None recorded',
  ].join('\n')
}

export function formatFinalReportText(report) {
  if (!report) return 'No final report available.'
  if (typeof report === 'string') return report

  const critics = (report.criticReviews ?? [])
    .map((r) => `- ${r.author ?? 'Critic'} (${r.rating ?? '?'}/5): ${r.text}`)
    .join('\n')

  return [
    report.headline ? `Headline: ${report.headline}` : '',
    `Overall score: ${report.overallScore ?? 'n/a'}/10 (${report.overallSentiment ?? 'unknown'})`,
    report.ratedLabel ? `Label: ${report.ratedLabel}` : '',
    '',
    'Emotional summary:',
    report.emotionalSummary ?? '',
    '',
    'Likes:',
    ...(report.likes ?? []).map((item) => `- ${item}`),
    '',
    'Dislikes:',
    ...(report.dislikes ?? []).map((item) => `- ${item}`),
    '',
    'Critic reviews:',
    critics || 'None',
    '',
    report.viewerQuote ? `Viewer quote: "${report.viewerQuote}"` : '',
    report.recommendations ? `Recommendations: ${report.recommendations}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function writeAiGradingArtifacts({
  videoMetadata,
  visualEvaluation,
  finalPrompt,
  finalReport,
}) {
  await fs.mkdir(GRADING_DIR, { recursive: true })

  if (videoMetadata) {
    await fs.writeFile(
      path.join(GRADING_DIR, 'video_metadata.json'),
      `${JSON.stringify(videoMetadata, null, 2)}\n`,
    )
  }

  if (visualEvaluation) {
    await fs.writeFile(
      path.join(GRADING_DIR, 'visual_evaluation.txt'),
      `${formatVisualEvaluationText(visualEvaluation)}\n`,
    )
  }

  if (finalPrompt) {
    await fs.writeFile(path.join(GRADING_DIR, 'final_prompt.txt'), finalPrompt)
  }

  if (finalReport) {
    await fs.writeFile(
      path.join(GRADING_DIR, 'final_report.txt'),
      `${formatFinalReportText(finalReport)}\n`,
    )
  }
}
