import { Link } from '@tanstack/react-router'
import { ArrowRight, Cloud, PenLine, TableProperties, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { LandingSectionHeading } from '#/components/landing/landing-section-heading'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export interface WorkflowStepItem {
  step: string
  title: string
  description: string
  extra?: string
}

const STEP_STYLES: Record<string, { bg: string; icon: LucideIcon }> = {
  '01': { bg: 'bg-violet-600', icon: UserPlus },
  '02': { bg: 'bg-orange-500', icon: TableProperties },
  '03': { bg: 'bg-emerald-600', icon: PenLine },
  '04': { bg: 'bg-fuchsia-600', icon: Cloud },
}

interface WorkflowStepRowProps extends WorkflowStepItem {}

export function WorkflowStepRow({
  step,
  title,
  description,
  extra,
}: WorkflowStepRowProps) {
  const style = STEP_STYLES[step] ?? STEP_STYLES['01']
  const Icon = style.icon

  return (
    <div className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:gap-5 sm:p-6">
      <div
        className={cn(
          'flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-white sm:size-16',
          style.bg,
        )}
      >
        <span className="text-sm font-bold leading-none sm:text-base">{step}</span>
        <Icon className="size-4 opacity-90" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
        {extra ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{extra}</p>
        ) : null}
      </div>
    </div>
  )
}

interface LandingWorkflowSectionProps {
  eyebrow?: string
  title: ReactNode
  description?: string
  steps: WorkflowStepItem[]
  showCta?: boolean
  ctaLabel?: string
  ctaHref?: string
}

export function LandingWorkflowSection({
  eyebrow = 'Simple process',
  title,
  description,
  steps,
  showCta = true,
  ctaLabel = 'Explore the full workflow',
  ctaHref = '/how-it-works',
}: LandingWorkflowSectionProps) {
  return (
    <section className="relative bg-background py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <LandingSectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <div className="mx-auto max-w-2xl space-y-4">
          {steps.map((item) => (
            <WorkflowStepRow key={item.step} {...item} />
          ))}
        </div>

        {showCta ? (
          <div className="mt-8 text-center sm:mt-10">
            <Button
              asChild
              size="lg"
              className="h-11 w-full max-w-xs rounded-full bg-violet-600 px-6 text-sm font-medium text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 sm:h-12 sm:w-auto sm:max-w-none sm:text-base"
            >
              <Link to={ctaHref}>
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
