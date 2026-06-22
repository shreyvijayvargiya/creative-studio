import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getSupabaseAdmin } from '#/lib/supabase/admin'

const resolveLoginEmailSchema = z.object({
  identifier: z.string().min(1),
})

export const resolveLoginEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => resolveLoginEmailSchema.parse(data))
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim()

    if (identifier.includes('@')) {
      return { email: identifier.toLowerCase() }
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('username', identifier.toLowerCase())
      .maybeSingle()

    if (error) {
      throw new Error('Unable to look up account')
    }

    if (!profile?.email) {
      throw new Error('No account found for that username')
    }

    return { email: profile.email as string }
  })
