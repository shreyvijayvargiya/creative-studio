import { createFileRoute } from '@tanstack/react-router'

import { generateLlmTxt } from '#/lib/blog/llm-txt'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () =>
        new Response(generateLlmTxt(), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
