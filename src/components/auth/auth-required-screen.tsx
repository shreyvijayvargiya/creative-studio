import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'

import { useLoginModal } from '#/components/auth/login-modal-provider'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Checking your session...</p>
      </div>
    </div>
  )
}

interface AuthRequiredScreenProps {
  /** When set, shown as the protected destination (e.g. Dashboard) */
  title?: string
  description?: string
  autoOpenLogin?: boolean
}

export function AuthRequiredScreen({
  title = 'Sign in to continue',
  description = 'Create an account or sign in to access your finance workspace, documents, and budget tools.',
  autoOpenLogin = true,
}: AuthRequiredScreenProps) {
  const { openLoginModal } = useLoginModal()

  useEffect(() => {
    if (autoOpenLogin) {
      openLoginModal()
    }
  }, [autoOpenLogin, openLoginModal])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <LogIn className="size-6 text-foreground" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" className="w-full" onClick={openLoginModal}>
            Sign in
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
