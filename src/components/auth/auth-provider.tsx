import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

import { mapProfileRow } from '#/lib/auth/user'
import { logAuthDebug, logAuthError } from '#/lib/auth/log-auth-error'
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
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null)
      return
    }

    const nextProfile = await fetchProfile(nextUser.id)
    setProfile(nextProfile)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }

    await loadProfile(user)
  }, [loadProfile, user])

  const applySessionUser = useCallback(
    (sessionUser: User | null) => {
      setUser(sessionUser)
      setIsLoading(false)

      if (!sessionUser) {
        setProfile(null)
        return
      }

      void loadProfile(sessionUser).catch((error) => {
        logAuthError('profile-load', error, { userId: sessionUser.id })
      })
    },
    [loadProfile],
  )

  const syncSessionAfterOAuth = useCallback(
    async (serverUser?: User | null) => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          logAuthError('session-init', error)
        }

        const sessionUser = data.session?.user ?? serverUser ?? null
        applySessionUser(sessionUser)
      } catch (error) {
        logAuthError('session-init', error)
        applySessionUser(serverUser ?? null)
      }
    },
    [applySessionUser],
  )

  useEffect(() => {
    let isMounted = true

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (!isMounted) {
          return
        }

        if (error) {
          logAuthError('session-init', error)
          toast.error(error.message)
        }

        applySessionUser(data.session?.user ?? null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        logAuthError('session-init', error)
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      }
    }

    void initSession()

    const loadingTimeout = window.setTimeout(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    }, 8_000)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer async work — awaiting inside this callback can deadlock getSession().
      window.setTimeout(() => {
        if (!isMounted) {
          return
        }

        applySessionUser(session?.user ?? null)
      }, 0)
    })

    return () => {
      isMounted = false
      window.clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [applySessionUser])

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

      setUser(data.user)
      await loadProfile(data.user)
      toast.success('Signed in successfully')
    },
    [loadProfile, resolveLoginEmailFn],
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
        setUser(data.session.user)
        await loadProfile(data.session.user)
        toast.success('Account created')
        return
      }

      toast.success('Check your email to confirm your account')
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(error.message)
      return
    }

    setUser(null)
    setProfile(null)
    toast.success('Signed out')
  }, [])

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
