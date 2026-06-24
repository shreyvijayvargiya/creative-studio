import { getCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL

  if (!url) {
    throw new Error(
      'Missing SUPABASE_URL or VITE_SUPABASE_URL server environment variable.',
    )
  }

  return url
}

function getSupabaseAnonKey(): string {
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

  if (!key) {
    throw new Error(
      'Missing SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY server environment variable.',
    )
  }

  return key
}

export function getSupabaseServerClient(): SupabaseClient {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options)
        })
      },
    },
  })
}
