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
        'relative flex min-h-[70vh] flex-col justify-center overflow-hidden bg-background pt-28 pb-16',
        className,
      )}
    >
      <LandingGradientBackground />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300">
          {eyebrow}
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]">
          {title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-violet-600 px-6 text-base font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700"
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
