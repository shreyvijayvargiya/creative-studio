import { AuthProvider } from '#/components/auth/auth-provider'
import { LoginModalProvider } from '#/components/auth/login-modal-provider'
import { SubscribeModalProvider } from '#/components/billing/subscribe-modal-provider'
import { CookieConsentBar } from '#/components/layout/cookie-consent-bar'
import { ThemeProvider } from '#/components/layout/theme-provider'
import { ThemeToaster } from '#/components/layout/theme-toaster'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginModalProvider>
          <SubscribeModalProvider>
            {children}
            <ThemeToaster />
            <CookieConsentBar />
          </SubscribeModalProvider>
        </LoginModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
