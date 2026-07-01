import { getSupabaseAdmin } from '#/lib/supabase/admin'

export async function resolveLoginEmailOnServer(identifier: string): Promise<{
  email: string
}> {
  const trimmed = identifier.trim()

  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase() }
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('username', trimmed.toLowerCase())
    .maybeSingle()

  if (error) {
    throw new Error('Unable to look up account')
  }

  if (!profile?.email) {
    throw new Error('No account found for that username')
  }

  return { email: profile.email as string }
}
