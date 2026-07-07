import { SidebarNav } from '#/components/layout/sidebar-nav'
import { useSidebar } from '#/components/layout/sidebar-provider'
import { SidebarUserFooter } from '#/components/layout/sidebar-user'
import { SidebarWorkspaceSwitcher } from '#/components/layout/sidebar-workspace'
import { SidebarUpgradeButton } from '#/components/billing/sidebar-upgrade-button'
import { cn } from '#/lib/utils'

const PANEL_HEIGHT = 'h-[calc(100svh-1rem)]'

interface SidebarContentProps {
  onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="crm-sidebar flex-1 space-y-4 overflow-y-auto p-3 pt-4">
        <SidebarWorkspaceSwitcher />
        <SidebarNav onNavigate={onNavigate} />
      </div>

      <div className="border-t border-border p-3 space-y-3">
        <SidebarUpgradeButton />
        <SidebarUserFooter />
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn(
        'hidden shrink-0 self-start transition-[width] duration-300 ease-in-out lg:block',
        collapsed ? 'w-0 overflow-hidden' : 'w-64',
      )}
    >
      <aside
        className={cn(
          'crm-sidebar sticky top-2 flex flex-col overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground shadow-sm',
          PANEL_HEIGHT,
          collapsed ? 'pointer-events-none opacity-0' : 'w-64',
        )}
        aria-label="Main navigation"
        aria-hidden={collapsed}
      >
        {!collapsed ? <SidebarContent /> : null}
      </aside>
    </div>
  )
}
