import { useRouterState } from '@tanstack/react-router'

import { useAuth } from '#/components/auth/auth-provider'
import {
  AuthLoadingScreen,
  AuthRequiredScreen,
} from '#/components/auth/auth-required-screen'
import { AppAiSidebarDesktop } from '#/components/layout/app-ai-sidebar'
import { DesktopSidebar } from '#/components/layout/sidebar'
import { Topbar } from '#/components/layout/topbar'
import { requiresAuth } from '#/lib/routes/public-paths'

interface AppShellLayoutProps {
  children: React.ReactNode
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { isAuthenticated, isLoading } = useAuth()

  const mustAuthenticate = requiresAuth(pathname)

  if (mustAuthenticate && isLoading) {
    return <AuthLoadingScreen />
  }

  if (mustAuthenticate && !isAuthenticated) {
    return <AuthRequiredScreen />
  }

  return (
    <div className="flex h-svh gap-2 overflow-hidden bg-background p-2 text-foreground">
      <DesktopSidebar />

      <div className="sticky top-2 flex h-[calc(100svh-1rem)] min-h-0 min-w-0 flex-1 flex-col gap-2">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>

      <AppAiSidebarDesktop />
    </div>
  )
}
