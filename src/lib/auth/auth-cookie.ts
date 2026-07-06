import type { User } from '@supabase/supabase-js'

export const AUTH_COOKIE_KEY = 'finance-crm-auth'
export const AUTH_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60

interface AuthCookiePayload {
  userId: string
  email: string
  exp: number
}

function isBrowser(): boolean {
  return typeof document !== 'undefined'
}

export function setAuthCookie(user: Pick<User, 'id' | 'email'>): void {
  if (!isBrowser()) {
    return
  }

  const payload: AuthCookiePayload = {
    userId: user.id,
    email: user.email ?? '',
    exp: Date.now() + AUTH_COOKIE_MAX_AGE_SECONDS * 1000,
  }

  const value = encodeURIComponent(JSON.stringify(payload))
  document.cookie = `${AUTH_COOKIE_KEY}=${value}; path=/; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

export function readAuthCookie(): AuthCookiePayload | null {
  if (!isBrowser()) {
    return null
  }

  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${AUTH_COOKIE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
    )

    if (!match?.[1]) {
      return null
    }

    const parsed = JSON.parse(decodeURIComponent(match[1])) as AuthCookiePayload

    if (!parsed.userId || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      clearAuthCookie()
      return null
    }

    return parsed
  } catch {
    clearAuthCookie()
    return null
  }
}

export function clearAuthCookie(): void {
  if (!isBrowser()) {
    return
  }

  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0`
}

export function userFromAuthCookie(payload: AuthCookiePayload): User {
  return {
    id: payload.userId,
    email: payload.email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '',
  } as User
}

export function getInitialAuthState(): {
  isLoading: boolean
  user: User | null
} {
  const cached = readAuthCookie()

  if (cached) {
    return {
      isLoading: false,
      user: userFromAuthCookie(cached),
    }
  }

  const storedUser = readSupabaseUserFromStorage()

  return {
    isLoading: false,
    user: storedUser,
  }
}

function readSupabaseUserFromStorage(): User | null {
  if (!isBrowser()) {
    return null
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

    if (!supabaseUrl) {
      return null
    }

    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    const storageKey = `sb-${projectRef}-auth-token`
    const raw = localStorage.getItem(storageKey)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      user?: User
      currentSession?: { user?: User }
    }

    const sessionUser = parsed.user ?? parsed.currentSession?.user ?? null

    if (!sessionUser?.id) {
      return null
    }

    return sessionUser
  } catch {
    return null
  }
}
