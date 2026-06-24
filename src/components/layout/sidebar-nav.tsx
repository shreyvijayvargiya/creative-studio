import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

import {
  isNavGroupActive,
  isNavItemActive,
  navSections,
} from '#/components/layout/nav-config'
import type { NavChildItem, NavGroupItem } from '#/components/layout/nav-config'

interface SidebarNavProps {
  onNavigate?: () => void
}

function NavLeafLink({
  item,
  onNavigate,
}: {
  item: NavChildItem
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
        'flex h-8 items-center rounded-md px-2 text-sm transition-colors',
        active
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        item.phaseTwo && 'opacity-80',
      )}
    >
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  )
}

function NavGroup({
  item,
  onNavigate,
}: {
  item: NavGroupItem
  onNavigate?: () => void
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const groupActive = isNavGroupActive(pathname, item)
  const [open, setOpen] = useState(groupActive)

  useEffect(() => {
    if (groupActive) {
      setOpen(true)
    }
  }, [groupActive])

  if (!item.children?.length) {
    if (!item.href) {
      return null
    }

    const active = isNavItemActive(pathname, item.href)

    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          'flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors',
          active
            ? 'bg-accent font-medium text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          item.phaseTwo && 'opacity-80',
        )}
      >
        <item.icon className="size-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge ? (
          <Badge variant="secondary" className="text-[10px]">
            {item.badge}
          </Badge>
        ) : null}
      </Link>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors',
          groupActive
            ? 'font-medium text-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <item.icon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-90',
          )}
        />
      </button>

      {open ? (
        <div className="relative ml-3.5 space-y-0.5 border-l border-border pl-2.5">
          {item.children.map((child) => (
            <NavLeafLink
              key={child.href}
              item={child}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <div className="space-y-6">
      {navSections.map((section) => (
        <div key={section.label} className="space-y-1">
          <p className="px-2 text-xs font-medium text-muted-foreground">
            {section.label}
          </p>
          <nav className="space-y-0.5">
            {section.items.map((item) => (
              <NavGroup
                key={item.label}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        </div>
      ))}
    </div>
  )
}
