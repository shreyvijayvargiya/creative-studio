import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'

import { LANDING_NAV_LINKS } from '#/components/landing/landing-content'
import { LandingLogo } from '#/components/landing/landing-logo'
import { ThemeToggleButton } from '#/components/layout/theme-toggle-button'
import { Button } from '#/components/ui/button'
import { APP_NAME, APP_STUDIO_HREF } from '#/lib/brand'
import { cn } from '#/lib/utils'

interface LandingNavProps {
  className?: string
}

export function LandingNav({ className }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'absolute inset-x-0 top-4 z-50 mx-auto max-w-5xl px-4 sm:px-6',
        className,
      )}
    >
      <div className="mx-auto flex h-12 items-center justify-between gap-2 rounded-full border border-border/60 bg-white px-3 shadow-lg shadow-blue-500/5 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 dark:border-blue-500/20 dark:bg-zinc-900 sm:h-14 sm:gap-4 sm:px-6">
        <LandingLogo />

        <nav className="hidden items-center gap-4 md:flex">
          {LANDING_NAV_LINKS.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              to={link.href}
              hash={'hash' in link ? link.hash : undefined}
              className="text-sm font-medium text-secondary-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: link.href === '/', includeHash: false }}
              activeProps={{ className: 'text-foreground' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggleButton />
          <Button
            asChild
            className="h-9 rounded-full bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Link to={APP_STUDIO_HREF}>Open {APP_NAME}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggleButton />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {LANDING_NAV_LINKS.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                to={link.href}
                hash={'hash' in link ? link.hash : undefined}
                className="rounded-sm px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            <Button
              asChild
              className="h-10 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link to={APP_STUDIO_HREF} onClick={() => setMobileOpen(false)}>
                Open {APP_NAME}
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
