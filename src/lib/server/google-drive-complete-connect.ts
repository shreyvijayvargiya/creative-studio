import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  exchangeDriveOAuthCode,
  getDriveOAuthRedirectUri,
  logGoogleDriveOAuthConfig,
  verifyOAuthState,
} from '#/lib/google-drive/oauth'
import {
  getUserDriveConnection,
  saveUserDriveConnection,
} from '#/lib/google-drive/tokens'
import { requireAuthUser } from '#/lib/server/require-auth-user'

const completeGoogleDriveConnectSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
})

export const completeGoogleDriveConnect = createServerFn({ method: 'POST' })
  .validator((data: unknown) => completeGoogleDriveConnectSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    const { userId, redirectOrigin } = verifyOAuthState(data.state)

    if (userId !== user.id) {
      throw new Error('Google Drive connection does not match the signed-in user')
    }

    const redirectUri = getDriveOAuthRedirectUri(redirectOrigin)

    try {
      const tokens = await exchangeDriveOAuthCode(data.code, redirectUri)

      const existing = await getUserDriveConnection(user.id)
      const refreshToken = tokens.refreshToken ?? existing?.refreshToken

      if (!refreshToken) {
        throw new Error(
          'Google did not provide a refresh token. Revoke app access at myaccount.google.com/permissions and try again.',
        )
      }

      await saveUserDriveConnection(user.id, {
        refreshToken,
        googleEmail: tokens.googleEmail ?? existing?.googleEmail ?? null,
        appFolderId: existing?.appFolderId ?? null,
      })

      return {
        ok: true as const,
        googleEmail: tokens.googleEmail ?? existing?.googleEmail ?? null,
      }
    } catch (error) {
      logGoogleDriveOAuthConfig(redirectUri)
      console.error('[google-drive][complete-connect]', {
        userId: user.id,
        redirectOrigin,
        redirectUri,
        error,
      })
      throw error
    }
  })
