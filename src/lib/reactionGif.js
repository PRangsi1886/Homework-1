const REACTION_TIERS = [
  {
    min: 0,
    max: 20,
    label: 'Sad Keanu',
    emoji: '🥪',
    gif: '/reactions/sad.gif',
  },
  {
    min: 21,
    max: 40,
    label: 'Keanu is thinking…',
    emoji: '🤔',
    gif: '/reactions/meh.gif',
  },
  {
    min: 41,
    max: 60,
    label: 'Point Break mode',
    emoji: '🏄',
    gif: '/reactions/neutral.gif',
  },
  {
    min: 61,
    max: 80,
    label: 'Keanu approves',
    emoji: '👍',
    gif: '/reactions/happy.gif',
  },
  {
    min: 81,
    max: 100,
    label: "You're breathtaking!",
    emoji: '✨',
    gif: '/reactions/ecstatic.gif',
  },
]

const POSITIVE_WORDS = /smile|laugh|joy|delight|excited|happy|grin|amused|engaged|positive|love|enjoy/i
const NEGATIVE_WORDS = /frown|bored|confused|upset|sad|disgust|angry|negative|disengaged|distracted|dislike/i

export function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(Number(score) || 0)))
}

export function getReactionForScore(score) {
  const normalized = clampScore(score)
  const tier =
    REACTION_TIERS.find((t) => normalized >= t.min && normalized <= t.max) ??
    REACTION_TIERS[2]
  return { ...tier, score: normalized }
}

export function scoreFromEvaluation(evaluation) {
  if (evaluation?.reactionScore != null) {
    return clampScore(evaluation.reactionScore)
  }

  const text = [
    evaluation?.overallEngagement,
    evaluation?.summary,
    ...(evaluation?.observations ?? []).flatMap((o) => [o.expression, o.interpretation]),
  ]
    .filter(Boolean)
    .join(' ')

  let score = 55
  const positiveHits = (text.match(new RegExp(POSITIVE_WORDS.source, 'gi')) ?? []).length
  const negativeHits = (text.match(new RegExp(NEGATIVE_WORDS.source, 'gi')) ?? []).length

  score += positiveHits * 8
  score -= negativeHits * 10

  return clampScore(score)
}

export function scoreFromReport(report) {
  if (report?.scores?.engagement?.value != null) {
    return clampScore(report.scores.engagement.value)
  }
  if (report?.overallScore != null) {
    return clampScore(Number(report.overallScore) * 10)
  }
  const sentimentMap = { positive: 85, mixed: 55, neutral: 50, negative: 25 }
  return clampScore(sentimentMap[report?.overallSentiment] ?? 60)
}
