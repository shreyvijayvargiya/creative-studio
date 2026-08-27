import { useRouterState } from '@tanstack/react-router'

import { useAuth } from '#/components/auth/auth-provider'
import {
  AuthLoadingScreen,
  AuthRequiredScreen,
} from '#/components/auth/auth-required-screen'
import { AppAiSidebarDesktop } from '#/components/layout/app-ai-sidebar'
import { CreativeStudioSidebar } from '#/components/layout/creative-studio-sidebar'
import { DesktopSidebar } from '#/components/layout/sidebar'
import { Topbar } from '#/components/layout/topbar'
import { isStudioRoute } from '#/lib/marketing/tools'
import { requiresAuth } from '#/lib/routes/public-paths'

interface AppShellLayoutProps {
  children: React.ReactNode
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { isAuthenticated, isLoading } = useAuth()

  const mustAuthenticate = requiresAuth(pathname) && !isStudioRoute(pathname)
  const isCreativeStudioDemo = isStudioRoute(pathname)

  if (mustAuthenticate && isLoading) {
    return <AuthLoadingScreen />
  }

  if (mustAuthenticate && !isAuthenticated) {
    return <AuthRequiredScreen />
  }

  return (
    <div className="flex h-svh gap-2 overflow-hidden bg-background p-2 text-foreground">
      {isCreativeStudioDemo ? <CreativeStudioSidebar /> : <DesktopSidebar />}

      <div className="sticky top-2 flex h-[calc(100svh-1rem)] min-h-0 min-w-0 flex-1 flex-col gap-2">
        <Topbar demoMode={isCreativeStudioDemo} />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* DEMO: Finance CRM AI assistant hidden on Creative Studio
      <AppAiSidebarDesktop />
      */}
      {!isCreativeStudioDemo ? <AppAiSidebarDesktop /> : null}
    </div>
  )
}
