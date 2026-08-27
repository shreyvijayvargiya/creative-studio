import { Link } from '@tanstack/react-router'

import { APP_NAME, APP_TAGLINE } from '#/lib/brand'

export function LandingLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={className}>
      <span className="inline-flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <span className="text-xs font-semibold">K</span>
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight text-foreground max-[380px]:text-xs">
            {APP_NAME}
          </span>
          <span className="hidden text-[10px] leading-none text-muted-foreground sm:block">
            {APP_TAGLINE}
          </span>
        </span>
      </span>
    </Link>
  )
}
