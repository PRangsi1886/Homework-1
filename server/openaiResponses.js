export function parseJsonText(text) {
  if (!text?.trim()) {
    throw new Error('Model response did not contain valid JSON.')
  }

  const candidates = [text.trim()]

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenced) candidates.push(fenced[1].trim())

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) {
    candidates.push(text.slice(start, end + 1).trim())
  }

  let lastError
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(lastError?.message ?? 'Model response did not contain valid JSON.')
}

function getRefusalMessage(response) {
  const refusal = response.output?.find((item) => item.type === 'refusal')
  return refusal?.refusal ?? refusal?.content ?? null
}

export async function createTextResponse(openai, { model, instructions, input }) {
  const response = await openai.responses.create({
    model,
    instructions,
    input,
  })

  const refusal = getRefusalMessage(response)
  if (refusal) {
    throw new Error(typeof refusal === 'string' ? refusal : 'Model refused the request.')
  }

  return (response.output_text ?? '').trim()
}

export async function createJsonResponse(
  openai,
  { model, instructions, input, schema, schemaName },
  attempt = 0,
) {
  const response = await openai.responses.create({
    model,
    instructions:
      attempt === 0
        ? instructions
        : `${instructions}\n\nIMPORTANT: Return only valid JSON. All numeric fields must be JSON numbers (e.g. 75), never words (e.g. "seventy-five").`,
    input,
    text: {
      format: {
        type: 'json_schema',
        name: schemaName,
        strict: true,
        schema,
      },
    },
  })

  const refusal = getRefusalMessage(response)
  if (refusal) {
    throw new Error(typeof refusal === 'string' ? refusal : 'Model refused the request.')
  }

  try {
    return parseJsonText(response.output_text ?? '')
  } catch (err) {
    if (attempt === 0) {
      console.warn(`JSON parse failed for ${schemaName}, retrying once:`, err.message)
      return createJsonResponse(
        openai,
        { model, instructions, input, schema, schemaName },
        attempt + 1,
      )
    }
    throw err
  }
}

export function toResponseInputMessages(messages) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  }))
}

export function buildVisionInput(text, images) {
  return [
    {
      role: 'user',
      content: [
        { type: 'input_text', text },
        ...images.map((img) => ({
          type: 'input_image',
          image_url: img.dataUrl,
          detail: 'low',
        })),
      ],
    },
  ]
}
