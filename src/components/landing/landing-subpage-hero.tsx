import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { LandingGradientBackground } from '#/components/landing/landing-gradient-background'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface LandingSubpageHeroProps {
  eyebrow: string
  title: ReactNode
  description: string
  primaryCta?: { label: string; href: string }
  className?: string
}

export function LandingSubpageHero({
  eyebrow,
  title,
  description,
  primaryCta = { label: 'Get started free', href: '/dashboard' },
  className,
}: LandingSubpageHeroProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-[55vh] flex-col justify-center overflow-hidden bg-background pt-24 pb-12 sm:min-h-[70vh] sm:pt-28 sm:pb-16',
        className,
      )}
    >
      <LandingGradientBackground />

      <div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
        <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 sm:mb-5 sm:px-4 sm:text-sm dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300">
          {eyebrow}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-6xl lg:leading-[1.1]">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
          {description}
        </p>

        <div className="mt-6 flex justify-center sm:mt-8">
          <Button
            asChild
            size="lg"
            className="h-11 w-full max-w-xs rounded-full bg-violet-600 px-6 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 sm:h-12 sm:w-auto sm:max-w-none sm:text-base"
          >
            <Link to={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
