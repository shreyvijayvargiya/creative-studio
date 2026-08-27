import { Link, useRouterState } from '@tanstack/react-router'
import { Clapperboard, Hexagon, ImageIcon, PanelLeft, PanelLeftClose } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useSidebar } from '#/components/layout/sidebar-provider'
import { Button } from '#/components/ui/button'
import { isNavItemActive } from '#/components/layout/nav-config'
import { APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { STUDIO_PATHS, type StudioToolPath } from '#/lib/marketing/tools'
import { cn } from '#/lib/utils'

const PANEL_HEIGHT = 'h-[calc(100svh-1rem)]'

const STUDIO_NAV: Array<{
  label: string
  href: StudioToolPath
  icon: LucideIcon
}> = [
  { label: 'Images', href: STUDIO_PATHS.image, icon: ImageIcon },
  { label: 'Video', href: STUDIO_PATHS.video, icon: Clapperboard },
  { label: 'Logo', href: STUDIO_PATHS.logo, icon: Hexagon },
]

interface CreativeStudioSidebarContentProps {
  onNavigate?: () => void
  collapsed?: boolean
}

export function CreativeStudioSidebarContent({
  onNavigate,
  collapsed = false,
}: CreativeStudioSidebarContentProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-2 border-b border-border', collapsed ? 'justify-center p-3' : 'px-3 py-3')}>
        <Link
          to="/"
          onClick={onNavigate}
          className={cn(
            'flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted',
            collapsed && 'justify-center px-0',
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white">
            K
          </span>
          {collapsed ? null : (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                {APP_NAME}
              </span>
              <span className="block truncate text-[10px] leading-none text-muted-foreground">
                {APP_TAGLINE}
              </span>
            </span>
          )}
        </Link>
      </div>

      <nav className="crm-sidebar flex-1 space-y-1 overflow-y-auto p-2" aria-label="Studio tools">
        {STUDIO_NAV.map((item) => {
          const Icon = item.icon
          const active = isNavItemActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
            </Link>
          )
        })}
      </nav>

      {collapsed ? (
        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden w-full text-muted-foreground lg:inline-flex"
            onClick={toggleSidebar}
          >
            <PanelLeft className="size-4" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </div>
      ) : (
        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden w-full justify-start gap-2 text-muted-foreground lg:inline-flex"
            onClick={toggleSidebar}
          >
            <PanelLeftClose className="size-4" />
            Hide sidebar
          </Button>
        </div>
      )}
    </div>
  )
}

export function CreativeStudioSidebar() {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn(
        'hidden shrink-0 self-start transition-[width] duration-300 ease-in-out lg:block',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <aside
        className={cn(
          'crm-sidebar sticky top-2 flex flex-col overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground shadow-sm',
          PANEL_HEIGHT,
          collapsed ? 'w-16' : 'w-60',
        )}
        aria-label="Studio navigation"
      >
        <CreativeStudioSidebarContent collapsed={collapsed} />
      </aside>
    </div>
  )
}
