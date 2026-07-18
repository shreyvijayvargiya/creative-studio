import { createFileRoute } from '@tanstack/react-router'
import { handleRequest } from '@better-upload/server'

import { getS3ConfigStatus } from '#/lib/s3/client'
import { createUploadRouter } from '#/lib/s3/upload-router'

/**
 * Better Upload pre-signed URL endpoint (TanStack Start).
 * Client uploads go directly to AWS S3.
 */
export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const status = getS3ConfigStatus()
        if (!status.configured) {
          const message = `AWS S3 is not configured. Add ${status.missing.join(', ')} to .env and restart npm run dev.`
          console.error('[api/upload]', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          return await handleRequest(request, createUploadRouter())
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Upload router failed'
          console.error('[api/upload]', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
