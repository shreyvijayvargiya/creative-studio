import type { User } from '@supabase/supabase-js'

import { getSupabaseServerClient } from '#/lib/supabase/server'

export async function requireAuthUser(): Promise<User> {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    throw new Error('You must be signed in')
  }

  return user
}
