import { useRouterState } from '@tanstack/react-router'

import { AppShellLayout } from '#/components/layout/app-shell'
import { LandingLayout } from '#/components/layout/landing-layout'
import { DashboardAiPanelProvider } from '#/components/dashboard/dashboard-ai-panel-provider'
import { SidebarProvider } from '#/components/layout/sidebar-provider'
import { isPublicRoute } from '#/lib/routes/public-paths'

interface RootLayoutProps {
  children: React.ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (isPublicRoute(pathname)) {
    return <LandingLayout>{children}</LandingLayout>
  }

  if (pathname.startsWith('/api/')) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <DashboardAiPanelProvider>
        <AppShellLayout>{children}</AppShellLayout>
      </DashboardAiPanelProvider>
    </SidebarProvider>
  )
}
