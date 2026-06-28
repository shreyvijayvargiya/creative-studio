import { createServerFn } from '@tanstack/react-start'

import { deleteUserDriveConnection } from '#/lib/google-drive/tokens'
import { requireAuthUser } from '#/lib/server/require-auth-user'

export const disconnectGoogleDrive = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await requireAuthUser()
    await deleteUserDriveConnection(user.id)
    return { ok: true as const }
  },
)
