import { AuthProvider } from '#/components/auth/auth-provider'
import { LoginModalProvider } from '#/components/auth/login-modal-provider'
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
    <div className="min-h-screen bg-background text-foreground">
      <Topbar />
      <DesktopSidebar />
      <main
        className={cn(
          'mt-14 min-h-[calc(100vh-3.5rem)] p-6 transition-[margin] duration-300 ease-in-out',
          collapsed ? 'lg:ml-0' : 'lg:ml-60',
        )}
      >
        {children}
      </main>
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
        </LoginModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
