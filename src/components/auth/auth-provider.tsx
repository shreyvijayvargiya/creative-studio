import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { AuthChangeEvent, User } from '@supabase/supabase-js'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

import {
  clearAuthCookie,
  getInitialAuthState,
  setAuthCookie,
} from '#/lib/auth/auth-cookie'
import { logAuthDebug, logAuthError } from '#/lib/auth/log-auth-error'
import { mapProfileRow } from '#/lib/auth/user'
import { resolveLoginEmail } from '#/lib/server/resolve-login-email'
import { supabase } from '#/lib/supabase/client'
import type {
  EmailSignInInput,
  EmailSignUpInput,
  UserProfile,
} from '#/types/auth'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (input: EmailSignInInput) => Promise<void>
  signUpWithEmail: (input: EmailSignUpInput) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  syncSessionAfterOAuth: (serverUser?: User | null) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SIGNIFICANT_AUTH_EVENTS = new Set<AuthChangeEvent>([
  'INITIAL_SESSION',
  'SIGNED_IN',
  'SIGNED_OUT',
  'USER_UPDATED',
])

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, username, email, full_name, avatar_url, auth_provider, created_at, updated_at',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapProfileRow(data)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const resolveLoginEmailFn = useServerFn(resolveLoginEmail)
  const initialAuthRef = useRef(getInitialAuthState())
  const [user, setUser] = useState<User | null>(() => initialAuthRef.current.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const currentUserIdRef = useRef<string | null>(initialAuthRef.current.user?.id ?? null)
  const profileLoadedForUserIdRef = useRef<string | null>(null)
  const profileLoadPromiseRef = useRef<Promise<void> | null>(null)

  const loadProfile = useCallback(async (nextUser: User, force = false) => {
    if (!force && profileLoadedForUserIdRef.current === nextUser.id) {
      return
    }

    if (!force && profileLoadPromiseRef.current) {
      await profileLoadPromiseRef.current
      if (profileLoadedForUserIdRef.current === nextUser.id) {
        return
      }
    }

    const loadPromise = (async () => {
      const nextProfile = await fetchProfile(nextUser.id)
      if (currentUserIdRef.current === nextUser.id) {
        setProfile(nextProfile)
        profileLoadedForUserIdRef.current = nextUser.id
      }
    })()

    profileLoadPromiseRef.current = loadPromise

    try {
      await loadPromise
    } catch (error) {
      logAuthError('profile-load', error, { userId: nextUser.id })
    } finally {
      if (profileLoadPromiseRef.current === loadPromise) {
        profileLoadPromiseRef.current = null
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const userId = currentUserIdRef.current
    if (!userId) {
      setProfile(null)
      profileLoadedForUserIdRef.current = null
      return
    }

    profileLoadedForUserIdRef.current = null
    await loadProfile({ id: userId } as User, true)
  }, [loadProfile])

  const applySessionUser = useCallback(
    (sessionUser: User | null) => {
      setIsLoading(false)

      if (!sessionUser) {
        currentUserIdRef.current = null
        profileLoadedForUserIdRef.current = null
        clearAuthCookie()
        setUser(null)
        setProfile(null)
        return
      }

      const isSameUser = currentUserIdRef.current === sessionUser.id
      currentUserIdRef.current = sessionUser.id
      setAuthCookie(sessionUser)

      setUser((previous) => {
        if (previous?.id === sessionUser.id) {
          return previous
        }
        return sessionUser
      })

      if (!isSameUser) {
        setProfile(null)
        profileLoadedForUserIdRef.current = null
      }

      void loadProfile(sessionUser)
    },
    [loadProfile],
  )

  const handleAuthStateChange = useCallback(
    (event: AuthChangeEvent, sessionUser: User | null) => {
      if (event === 'TOKEN_REFRESHED') {
        if (sessionUser) {
          setAuthCookie(sessionUser)
        }
        return
      }

      if (!SIGNIFICANT_AUTH_EVENTS.has(event)) {
        return
      }

      if (
        event === 'INITIAL_SESSION' &&
        sessionUser?.id &&
        sessionUser.id === currentUserIdRef.current &&
        profileLoadedForUserIdRef.current === sessionUser.id
      ) {
        setIsLoading(false)
        return
      }

      // Trust Supabase's real session only. Keeping a stale finance-crm-auth
      // cookie while INITIAL_SESSION is null made the UI look signed-in while
      // server functions failed with "Auth session missing!".
      applySessionUser(sessionUser)
    },
    [applySessionUser],
  )

  const handleAuthStateChangeRef = useRef(handleAuthStateChange)
  handleAuthStateChangeRef.current = handleAuthStateChange

  const syncSessionAfterOAuth = useCallback(
    async (serverUser?: User | null) => {
      if (serverUser) {
        applySessionUser(serverUser)
        return
      }

      setIsLoading(true)

      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 3_000)),
        ])

        if (!result) {
          logAuthError('session-init', 'Timed out waiting for OAuth session')
          return
        }

        const { data, error } = result

        if (error) {
          logAuthError('session-init', error)
          return
        }

        if (data.session?.user) {
          applySessionUser(data.session.user)
        }
      } catch (error) {
        logAuthError('session-init', error)
      } finally {
        setIsLoading(false)
      }
    },
    [applySessionUser],
  )

  useEffect(() => {
    let isMounted = true
    const initialUser = initialAuthRef.current.user

    if (initialUser) {
      setAuthCookie(initialUser)
      void loadProfile(initialUser)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (!isMounted) {
          return
        }

        handleAuthStateChangeRef.current(event, session?.user ?? null)
      }, 0)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth/callback`

    logAuthDebug('sign-in-google', 'Starting Google OAuth', { redirectTo })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (error) {
      logAuthError('sign-in-google', error, { redirectTo })
      toast.error(error.message)
      throw error
    }

    logAuthDebug('sign-in-google', 'OAuth redirect URL issued', {
      redirectTo,
      providerUrl: data.url,
    })
  }, [])

  const signInWithEmail = useCallback(
    async ({ identifier, password }: EmailSignInInput) => {
      const { email } = await resolveLoginEmailFn({
        data: { identifier: identifier.trim() },
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logAuthError('sign-in-email', error, { email })
        throw new Error(error.message)
      }

      applySessionUser(data.user)
      toast.success('Signed in successfully')
    },
    [applySessionUser, resolveLoginEmailFn],
  )

  const signUpWithEmail = useCallback(
    async ({ username, email, password }: EmailSignUpInput) => {
      const normalizedUsername = username.trim().toLowerCase()

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: normalizedUsername,
            full_name: normalizedUsername,
          },
        },
      })

      if (error) {
        logAuthError('sign-up-email', error, {
          email: email.trim().toLowerCase(),
          username: normalizedUsername,
        })
        throw new Error(error.message)
      }

      if (data.session?.user) {
        applySessionUser(data.session.user)
        toast.success('Account created')
        return
      }

      toast.success('Check your email to confirm your account')
    },
    [applySessionUser],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message)
      return
    }

    applySessionUser(null)
    toast.success('Signed out')
  }, [applySessionUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: user !== null,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      syncSessionAfterOAuth,
    }),
    [
      user,
      profile,
      isLoading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      syncSessionAfterOAuth,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
