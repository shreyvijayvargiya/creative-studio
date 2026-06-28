import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getSubmissionSigningUrl } from '#/lib/docuseal/client'
import { requireAuthUser } from '#/lib/server/require-auth-user'

export const getSigningSession = createServerFn({ method: 'GET' })
  .validator((data: unknown) =>
    z.object({ submissionId: z.coerce.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAuthUser()

    const embedSrc = await getSubmissionSigningUrl(data.submissionId)

    return {
      submissionId: data.submissionId,
      embedSrc,
      title: 'ATO Tax Return 2025',
    }
  })
