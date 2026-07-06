import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'

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

export function AuthRequiredScreen() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { open, openLoginModal } = useLoginModal()
  const allowDismissRedirect = useRef(false)

  useEffect(() => {
    openLoginModal()
  }, [openLoginModal])

  useEffect(() => {
    if (open) {
      allowDismissRedirect.current = true
      return
    }

    if (allowDismissRedirect.current && !isAuthenticated) {
      void navigate({ to: '/' })
    }
  }, [open, isAuthenticated, navigate])

  return <div className="min-h-svh bg-background" aria-hidden />
}
