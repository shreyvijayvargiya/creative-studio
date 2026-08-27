import { Link, useRouterState } from '@tanstack/react-router'
import { Clapperboard, Hexagon, ImageIcon } from 'lucide-react'

import { STUDIO_PATHS } from '#/lib/marketing/tools'
import { cn } from '#/lib/utils'

const TOOLS = [
  { id: 'images', label: 'Images', href: STUDIO_PATHS.image, icon: ImageIcon },
  { id: 'video', label: 'Video', href: STUDIO_PATHS.video, icon: Clapperboard },
  { id: 'logo', label: 'Logo', href: STUDIO_PATHS.logo, icon: Hexagon },
] as const

export function CreativeStudioToolSwitcher() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const normalized = pathname.replace(/\/$/, '') || '/'

  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-1">
      {TOOLS.map((tool) => {
        const Icon = tool.icon
        const active = normalized === tool.href
        return (
          <Link
            key={tool.id}
            to={tool.href}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            {tool.label}
          </Link>
        )
      })}
    </div>
  )
}
