import { SidebarNav } from '#/components/layout/sidebar-nav'
import { useSidebar } from '#/components/layout/sidebar-provider'
import { SidebarUserFooter } from '#/components/layout/sidebar-user'
import { SidebarWorkspaceSwitcher } from '#/components/layout/sidebar-workspace'
import { cn } from '#/lib/utils'

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

      <div className="border-t border-border p-3">
        <SidebarUserFooter />
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  const { collapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'crm-sidebar fixed left-0 top-0 z-40 hidden h-svh flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width,transform,opacity] duration-300 ease-in-out lg:flex',
        collapsed
          ? 'w-0 -translate-x-full overflow-hidden border-r-0 opacity-0'
          : 'w-64 translate-x-0 opacity-100',
      )}
    >
      <SidebarContent />
    </aside>
  )
}
