const observationItem = {
  type: 'object',
  properties: {
    timestamp: { type: 'number' },
    timestampLabel: { type: 'string' },
    expression: { type: 'string' },
    interpretation: { type: 'string' },
  },
  required: ['timestamp', 'timestampLabel', 'expression', 'interpretation'],
  additionalProperties: false,
}

export const VISUAL_EVALUATION_SCHEMA = {
  type: 'object',
  properties: {
    reactionScore: { type: 'number', minimum: 0, maximum: 100 },
    overallEngagement: { type: 'string' },
    summary: { type: 'string' },
    observations: {
      type: 'array',
      items: observationItem,
    },
  },
  required: ['reactionScore', 'overallEngagement', 'summary', 'observations'],
  additionalProperties: false,
}

export const FINAL_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    overallScore: { type: 'number', minimum: 0, maximum: 10 },
    overallSentiment: {
      type: 'string',
      enum: ['positive', 'mixed', 'negative', 'neutral'],
    },
    ratedLabel: { type: 'string' },
    emotionalSummary: { type: 'string' },
    scores: {
      type: 'object',
      properties: {
        engagement: {
          type: 'object',
          properties: {
            value: { type: 'number', minimum: 0, maximum: 100 },
            label: { type: 'string' },
          },
          required: ['value', 'label'],
          additionalProperties: false,
        },
        visual: {
          type: 'object',
          properties: {
            value: { type: 'number', minimum: 0, maximum: 100 },
            label: { type: 'string' },
          },
          required: ['value', 'label'],
          additionalProperties: false,
        },
        verbal: {
          type: 'object',
          properties: {
            value: { type: 'number', minimum: 0, maximum: 100 },
            label: { type: 'string' },
          },
          required: ['value', 'label'],
          additionalProperties: false,
        },
      },
      required: ['engagement', 'visual', 'verbal'],
      additionalProperties: false,
    },
    keyMoments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timestampLabel: { type: 'string' },
          reaction: { type: 'string' },
          meaning: { type: 'string' },
        },
        required: ['timestampLabel', 'reaction', 'meaning'],
        additionalProperties: false,
      },
    },
    likes: {
      type: 'array',
      items: { type: 'string' },
    },
    dislikes: {
      type: 'array',
      items: { type: 'string' },
    },
    criticReviews: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          author: { type: 'string' },
          timeAgo: { type: 'string' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          text: { type: 'string' },
        },
        required: ['author', 'timeAgo', 'rating', 'text'],
        additionalProperties: false,
      },
    },
    viewerQuote: { type: 'string' },
    recommendations: { type: 'string' },
  },
  required: [
    'headline',
    'overallScore',
    'overallSentiment',
    'ratedLabel',
    'emotionalSummary',
    'scores',
    'keyMoments',
    'likes',
    'dislikes',
    'criticReviews',
    'viewerQuote',
    'recommendations',
  ],
  additionalProperties: false,
}
