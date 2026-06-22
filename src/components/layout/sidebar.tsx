import { Link, useRouterState } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'

import { useTheme } from '#/components/layout/theme-provider'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

import {
  isNavItemActive,
  mainNavItems,
  settingsNavItems,
} from '#/components/layout/nav-config'
import type { NavItem } from '#/components/layout/nav-config'

interface SidebarContentProps {
  onNavigate?: () => void
}

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate?: () => void
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const active = isNavItemActive(pathname, item.href)

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        item.phaseTwo && 'opacity-80',
      )}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <Badge variant="secondary" className="text-[10px]">
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  )
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-full flex-col">
      <div className="crm-sidebar flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Main Menu
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Settings
          </p>
          <nav className="space-y-1">
            {settingsNavItems.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </Button>
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="crm-sidebar fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-60 border-r border-border bg-card text-card-foreground lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  )
}
