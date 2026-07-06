import { useRouterState } from '@tanstack/react-router'

import { useAuth } from '#/components/auth/auth-provider'
import {
  AuthLoadingScreen,
  AuthRequiredScreen,
} from '#/components/auth/auth-required-screen'
import { DesktopSidebar } from '#/components/layout/sidebar'
import { useSidebar } from '#/components/layout/sidebar-provider'
import { Topbar } from '#/components/layout/topbar'
import { requiresAuth } from '#/lib/routes/public-paths'
import { cn } from '#/lib/utils'

interface AppShellLayoutProps {
  children: React.ReactNode
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { isAuthenticated, isLoading } = useAuth()
  const { collapsed } = useSidebar()

  const mustAuthenticate = requiresAuth(pathname)

  if (mustAuthenticate && isLoading) {
    return <AuthLoadingScreen />
  }

  if (mustAuthenticate && !isAuthenticated) {
    return <AuthRequiredScreen />
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <DesktopSidebar />

      <div
        className={cn(
          'flex min-h-svh min-w-0 flex-col overflow-x-hidden transition-[margin] duration-300 ease-in-out',
          collapsed ? 'lg:ml-0' : 'lg:ml-64',
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
