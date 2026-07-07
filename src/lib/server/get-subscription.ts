import { createServerFn } from '@tanstack/react-start'

import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSubscriptionForUser } from '#/lib/server/subscriptions-core'

export const getSubscription = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireAuthUser()
  return getSubscriptionForUser(user.id)
})
