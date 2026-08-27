import { createFileRoute } from '@tanstack/react-router'

import { generateLlmTxt } from '#/lib/blog/llm-txt'

function llmTxtResponse() {
  return new Response(generateLlmTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const Route = createFileRoute('/llm.txt')({
  server: {
    handlers: {
      GET: async () => llmTxtResponse(),
    },
  },
})
