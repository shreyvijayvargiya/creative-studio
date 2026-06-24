import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'

import { Button } from '#/components/ui/button'

export const COOKIE_CONSENT_KEY = 'finance-crm-cookie-consent'

export function CookieConsentBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
      setVisible(consent !== 'accepted')
    } catch {
      setVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    } catch {
      // Ignore storage failures and hide the banner for this session.
    }

    setVisible(false)
  }

  if (!visible) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 right-4 z-50 w-[min(100vw-2rem,22rem)] rounded-lg border border-border bg-background p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">We use cookies</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Essential cookies keep you signed in and remember your preferences.
              By continuing, you agree to our use of cookies for authentication
              and app functionality.
            </p>
          </div>
          <Button size="sm" className="w-full" onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
