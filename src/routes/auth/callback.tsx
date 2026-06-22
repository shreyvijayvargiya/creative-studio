import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { supabase } from '#/lib/supabase/client'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        toast.error(errorDescription)
        await navigate({ to: '/' })
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          toast.error(error.message)
          await navigate({ to: '/' })
          return
        }
      }

      await navigate({ to: '/settings' })
    }

    void completeSignIn()
  }, [navigate])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  )
}
