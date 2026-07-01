import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { resolveLoginEmailOnServer } from '#/lib/server/resolve-login-email-server'

const resolveLoginEmailSchema = z.object({
  identifier: z.string().min(1),
})

export const resolveLoginEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => resolveLoginEmailSchema.parse(data))
  .handler(async ({ data }) => resolveLoginEmailOnServer(data.identifier))
