export async function createTextResponse(openai, { model, instructions, input }) {
  const response = await openai.responses.create({
    model,
    instructions,
    input,
  })

  return (response.output_text ?? '').trim()
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
