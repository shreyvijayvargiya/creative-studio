import { createServerFn } from '@tanstack/react-start'

import { isGoogleDriveOAuthConfigured } from '#/lib/google-drive/oauth'
import { getUserDriveConnectionStatus } from '#/lib/google-drive/tokens'
import { requireAuthUser } from '#/lib/server/require-auth-user'

export const getGoogleDriveConnectionStatus = createServerFn({
  method: 'GET',
}).handler(async () => {
  const user = await requireAuthUser()
  const status = await getUserDriveConnectionStatus(user.id)

  return {
    ...status,
    oauthConfigured: isGoogleDriveOAuthConfigured(),
  }
})
