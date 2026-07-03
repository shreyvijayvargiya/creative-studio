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

import { LandingGradientBackground } from '#/components/landing/landing-gradient-background'
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
        'absolute flex items-center gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 shadow-lg shadow-violet-500/5 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
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
    <div className="relative mx-auto flex h-[22rem] w-full max-w-md items-center justify-center sm:h-[26rem] lg:mx-0 lg:h-full lg:max-w-none">
      <div className="relative flex size-56 items-center justify-center rounded-[2rem] border border-violet-200/60 bg-card/90 shadow-2xl shadow-violet-500/10 backdrop-blur-sm dark:border-violet-500/30 sm:size-64">
        <div className="flex size-28 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-lg shadow-violet-600/30 sm:size-32">
          <FileText className="size-14 sm:size-16" strokeWidth={1.5} />
        </div>
      </div>

      <FloatingCard
        icon={<Calculator className="size-5 text-violet-600" />}
        title="ATO PDF"
        subtitle="Ready to generate"
        className="top-0 right-0 w-44 sm:-right-4 sm:w-48"
      />
      <FloatingCard
        icon={<PenLine className="size-5 text-emerald-600" />}
        title="DocuSeal"
        subtitle="E-sign built in"
        className="top-1/2 -right-2 w-44 -translate-y-1/2 sm:-right-8 sm:w-48"
      />
      <FloatingCard
        icon={<Cloud className="size-5 text-violet-600" />}
        title="Google Drive"
        subtitle="Per-user backup"
        className="bottom-4 left-0 w-44 sm:-left-6 sm:w-48"
      />
    </div>
  )
}

export function LandingHomeHero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background pt-24 pb-16">
      <LandingGradientBackground />

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300">
            <Sparkles className="size-4" />
            Built for accounting practices
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            The workspace for{' '}
            <span className="text-violet-600 dark:text-violet-400">accounting</span>{' '}
            <span className="text-muted-foreground">delivered.</span>
          </h1>

          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            Plan client budgets, generate ATO-ready tax PDFs, collect e-signatures,
            and store documents securely —{' '}
            <span className="font-semibold text-foreground">
              all in one calm workspace.
            </span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-violet-600 px-6 text-base font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700"
            >
              <Link to="/dashboard">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Free to start · No credit card required
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
            {HERO_HOME_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}
