import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Briefcase,
  Code2,
  Rocket,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { LandingGradientBackground } from '#/components/landing/landing-gradient-background'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export interface CtaBenefitItem {
  icon: LucideIcon
  label: string
  iconBg: string
  iconColor: string
}

const DEFAULT_CTA_BENEFITS: CtaBenefitItem[] = [
  {
    icon: TrendingUp,
    label: 'Never miss a client filing deadline',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Rocket,
    label: 'Generate ATO-ready PDFs in minutes',
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Briefcase,
    label: 'Collect e-signatures without switching tools',
    iconBg: 'bg-teal-100 dark:bg-teal-950/50',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    icon: Code2,
    label: 'Keep every client document in one workspace',
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
]

function BenefitItem({ icon: Icon, label, iconBg, iconColor }: CtaBenefitItem) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/90 px-4 py-3.5 backdrop-blur-sm">
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          iconBg,
        )}
      >
        <Icon className={cn('size-5', iconColor)} strokeWidth={1.75} />
      </div>
      <p className="text-left text-sm font-medium leading-snug text-foreground">
        {label}
      </p>
    </div>
  )
}

interface LandingCtaSectionProps {
  badge?: string
  title: ReactNode
  description: string
  benefits?: CtaBenefitItem[]
  primaryLabel?: string
  primaryHref?: string
  footer?: string
  fullScreen?: boolean
}

export function LandingCtaSection({
  badge = 'Save hours every week',
  title,
  description,
  benefits = DEFAULT_CTA_BENEFITS,
  primaryLabel = 'Get started free',
  primaryHref = '/dashboard',
  footer = 'Join accounting teams · Free to start',
  fullScreen = true,
}: LandingCtaSectionProps) {
  return (
    <section
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden bg-background py-12 sm:py-20',
        fullScreen && 'min-h-0 sm:min-h-screen',
      )}
    >
      <LandingGradientBackground />

      <div className="relative z-0 mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-xl shadow-blue-500/10 backdrop-blur-sm sm:rounded-[2rem] sm:p-8 md:p-12 dark:border-blue-500/20 dark:shadow-blue-500/5">
          <div className="pointer-events-none absolute -top-16 -left-16 size-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 size-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative text-center">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 sm:mb-6 sm:px-4 sm:text-sm dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
              <Zap className="size-4" />
              {badge}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:mt-5 sm:text-base">
              {description}
            </p>

            {benefits.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <BenefitItem key={benefit.label} {...benefit} />
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 w-full max-w-sm rounded-full bg-blue-600 px-8 text-base font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 sm:w-auto"
              >
                <Link to={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {footer ? (
                <p className="text-sm text-muted-foreground">{footer}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
