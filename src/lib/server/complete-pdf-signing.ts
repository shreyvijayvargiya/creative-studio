import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  completePdfSigningInputSchema,
  completePdfSigningOnServer,
} from '#/lib/server/complete-pdf-signing-server'

export const completePdfSigning = createServerFn({ method: 'POST' })
  .validator((data: unknown) => completePdfSigningInputSchema.parse(data))
  .handler(async ({ data }) => completePdfSigningOnServer(data.submissionId))
