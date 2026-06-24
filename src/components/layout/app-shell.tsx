import { AuthProvider } from '#/components/auth/auth-provider'
import { LoginModalProvider } from '#/components/auth/login-modal-provider'
import { CookieConsentBar } from '#/components/layout/cookie-consent-bar'
import { DesktopSidebar } from '#/components/layout/sidebar'
import { SidebarProvider, useSidebar } from '#/components/layout/sidebar-provider'
import { ThemeProvider } from '#/components/layout/theme-provider'
import { ThemeToaster } from '#/components/layout/theme-toaster'
import { Topbar } from '#/components/layout/topbar'
import { cn } from '#/lib/utils'

interface AppShellProps {
  children: React.ReactNode
}

function AppShellLayout({ children }: AppShellProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-svh bg-background text-foreground">
      <DesktopSidebar />

      <div
        className={cn(
          'flex min-h-svh flex-col transition-[margin] duration-300 ease-in-out',
          collapsed ? 'lg:ml-0' : 'lg:ml-64',
        )}
      >
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginModalProvider>
          <SidebarProvider>
            <AppShellLayout>{children}</AppShellLayout>
          </SidebarProvider>
          <ThemeToaster />
          <CookieConsentBar />
        </LoginModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
