import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  createDriveConnectUrl,
  isGoogleDriveOAuthConfigured,
} from '#/lib/google-drive/oauth'
import { requireAuthUser } from '#/lib/server/require-auth-user'

const getGoogleDriveConnectUrlSchema = z.object({
  redirectOrigin: z.string().url(),
})

export const getGoogleDriveConnectUrl = createServerFn({ method: 'POST' })
  .validator((data: unknown) => getGoogleDriveConnectUrlSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isGoogleDriveOAuthConfigured()) {
      throw new Error(
        'Google Drive OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (or CLIENT_ID and CLIENT_SECRET).',
      )
    }

    const user = await requireAuthUser()

    return {
      url: createDriveConnectUrl(user.id, data.redirectOrigin),
    }
  })
