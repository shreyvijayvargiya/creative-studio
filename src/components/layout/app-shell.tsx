import { DesktopSidebar } from '#/components/layout/sidebar'
import { ThemeProvider } from '#/components/layout/theme-provider'
import { ThemeToaster } from '#/components/layout/theme-toaster'
import { Topbar } from '#/components/layout/topbar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Topbar />
        <DesktopSidebar />
        <main className="mt-14 min-h-[calc(100vh-3.5rem)] p-6 lg:ml-60">
          {children}
        </main>
      </div>
      <ThemeToaster />
    </ThemeProvider>
  )
}
