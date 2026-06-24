import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { exchangeOAuthCodeOnServer } from '#/lib/auth/exchange-oauth-code'

const exchangeOAuthCodeSchema = z.object({
  code: z.string().min(1),
})

export const exchangeOAuthCode = createServerFn({ method: 'POST' })
  .validator((data: unknown) => exchangeOAuthCodeSchema.parse(data))
  .handler(async ({ data }) => exchangeOAuthCodeOnServer(data.code))
