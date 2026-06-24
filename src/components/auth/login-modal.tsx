import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '#/components/auth/auth-provider'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { normalizeUsername } from '#/lib/auth/user'
import { logAuthError } from '#/lib/auth/log-auth-error'

type AuthMode = 'sign-in' | 'sign-up'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setMode('sign-in')
      setUsername('')
      setIdentifier('')
      setEmail('')
      setPassword('')
      setIsSubmitting(false)
      setIsGoogleLoading(false)
    }
  }, [open])

  const closeModal = () => onOpenChange(false)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Google sign-in failed'
      logAuthError(
        mode === 'sign-in' ? 'sign-in-google' : 'sign-up-google',
        error,
        { mode },
      )
      toast.error(message)
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === 'sign-in') {
        await signInWithEmail({
          identifier: identifier.trim(),
          password,
        })
      } else {
        await signUpWithEmail({
          username: normalizeUsername(username),
          email: email.trim(),
          password,
        })
      }

      closeModal()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Request failed'
      logAuthError(
        mode === 'sign-in' ? 'sign-in-email' : 'sign-up-email',
        error,
        { mode },
      )
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="space-y-1 border-b border-border px-6 py-5 text-left">
          <DialogTitle>
            {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'sign-in'
              ? 'Sign in with your username or email, or continue with Google.'
              : 'Choose a username and password, or continue with Google.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            disabled={isSubmitting || isGoogleLoading}
            onClick={() => void handleGoogleSignIn()}
          >
            {isGoogleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {mode === 'sign-up' ? (
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  autoComplete="username"
                  placeholder="rajat_finance"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  minLength={3}
                  pattern="[a-zA-Z0-9_]+"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and underscores only.
                </p>
              </div>
            ) : null}

            {mode === 'sign-in' ? (
              <div className="space-y-2">
                <Label htmlFor="login-identifier">Username or email</Label>
                <Input
                  id="login-identifier"
                  autoComplete="username"
                  placeholder="rajat_finance or you@example.com"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete={
                  mode === 'sign-in' ? 'current-password' : 'new-password'
                }
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode('sign-up')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode('sign-in')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
