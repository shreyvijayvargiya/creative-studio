import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Calculator,
  Cloud,
  FileText,
  PenLine,
  Sparkles,
} from 'lucide-react'

import { HERO_HOME_STATS } from '#/components/landing/landing-content'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface FloatingCardProps {
  icon: ReactNode
  title: string
  subtitle: string
  className?: string
}

function FloatingCard({ icon, title, subtitle, className }: FloatingCardProps) {
  return (
    <div
      className={cn(
        'absolute hidden items-center gap-2.5 rounded-2xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-lg shadow-violet-500/5 backdrop-blur-sm sm:flex sm:gap-3 sm:px-4 sm:py-3',
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted sm:size-10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[16rem] w-full max-w-xs items-center justify-center overflow-hidden sm:h-[22rem] sm:max-w-md lg:mx-0 lg:h-[26rem] lg:max-w-none">
      <div className="relative flex size-44 items-center justify-center rounded-[1.75rem] border border-violet-200/60 bg-card/90 shadow-2xl shadow-violet-500/10 backdrop-blur-sm dark:border-violet-500/30 sm:size-56 sm:rounded-[2rem] lg:size-64">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-600/30 sm:size-28 lg:size-32">
          <FileText className="size-12 sm:size-14 lg:size-16" strokeWidth={1.5} />
        </div>
      </div>

      <FloatingCard
        icon={<Calculator className="size-5 text-violet-600" />}
        title="ATO PDF"
        subtitle="Ready to generate"
        className="top-0 right-0 w-40 sm:-right-4 sm:w-48"
      />
      <FloatingCard
        icon={<PenLine className="size-5 text-emerald-600" />}
        title="DocuSeal"
        subtitle="E-sign built in"
        className="top-1/2 -right-2 w-40 -translate-y-1/2 sm:-right-8 sm:w-48"
      />
      <FloatingCard
        icon={<Cloud className="size-5 text-violet-600" />}
        title="Google Drive"
        subtitle="Per-user backup"
        className="bottom-4 left-0 w-40 sm:-left-6 sm:w-48"
      />
    </div>
  )
}

function LandingHomeHeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full">
      <div className="absolute inset-0 bg-linear-to-br from-violet-950/30 via-background to-fuchsia-950/20 dark:from-violet-950/50 dark:to-fuchsia-950/30" />
      <div className="absolute top-1/4 left-1/4 h-125 w-125 rounded-full bg-violet-500/8 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-100 w-100 rounded-full bg-violet-500/5 blur-3xl" />
    </div>
  )
}

export function LandingHomeHero() {
  return (
    <section className="relative flex h-screen min-h-screen flex-col justify-center overflow-hidden bg-background pt-20 pb-12 sm:pt-24 sm:pb-16">
      <LandingHomeHeroBackground />

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 sm:mb-6 sm:px-4 sm:text-sm dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300">
            <Sparkles className="size-4 shrink-0" />
            Built for accounting practices
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-6xl lg:leading-[1.1]">
            The workspace for{' '}
            <span className="text-violet-600 dark:text-violet-400">accounting</span>{' '}
            <span className="text-muted-foreground">delivered.</span>
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
            Plan client budgets, generate ATO-ready tax PDFs, collect e-signatures,
            and store documents securely —{' '}
            <span className="font-semibold text-foreground">
              all in one calm workspace.
            </span>
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-11 w-full rounded-full bg-violet-600 px-6 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 sm:h-12 sm:w-auto sm:text-base"
            >
              <Link to="/dashboard">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
              Free to start · No credit card required
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/60 pt-6 sm:mt-12 sm:gap-6 sm:pt-8">
            {HERO_HOME_STATS.map((stat) => (
              <div key={stat.label} className="min-w-0 text-center sm:text-left">
                <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:mt-1 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}
