import { createFileRoute } from '@tanstack/react-router'
import { Cloud, HardDrive, LayoutDashboard } from 'lucide-react'

import { LANDING_STEPS } from '#/components/landing/landing-content'
import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import {
  LandingWorkflowSection,
  type WorkflowStepItem,
} from '#/components/landing/landing-workflow-section'
import { cn } from '#/lib/utils'

const WORKFLOW_STEPS: WorkflowStepItem[] = LANDING_STEPS.map((step, index) => ({
  ...step,
  extra:
    index === 1
      ? 'Capture income, expenses, and taxpayer details in a spreadsheet-style grid with ATO-oriented fields.'
      : index === 2
        ? 'DocuSeal embeds directly in the app so clients sign without leaving your branded experience.'
        : undefined,
}))

const AFTER_SIGNING = [
  {
    number: '01',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    text: 'Document appears in your dashboard with created date and type.',
  },
  {
    number: '02',
    icon: HardDrive,
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    text: 'Optional PIN protection when sharing a view link externally.',
  },
  {
    number: '03',
    icon: Cloud,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    text: 'Google Drive backup uses your connected account and storage quota.',
  },
] as const

export const Route = createFileRoute('/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How It Works | Finance CRM Accounting Workflow' },
      {
        name: 'description',
        content:
          'Learn how Finance CRM takes you from budget planning to ATO tax PDF generation, e-signing, and Google Drive backup in four simple steps.',
      },
    ],
  }),
  component: HowItWorksPage,
})

function HowItWorksPage() {
  return (
    <>
      <LandingSubpageHero
        eyebrow="How it works"
        title={
          <>
            A clear path from budget to{' '}
            <LandingGradientText>signed document</LandingGradientText>
          </>
        }
        description="Finance CRM connects planning, PDF generation, e-signing, and storage in one continuous workflow — designed for accounting professionals and their clients."
        primaryCta={{ label: 'Try it free', href: '/dashboard' }}
      />

      <LandingWorkflowSection
        eyebrow="The workflow"
        title={
          <>
            The complete{' '}
            <LandingGradientText>workflow</LandingGradientText>
          </>
        }
        description="Each step builds on the last. No exports to mystery folders or manual uploads."
        steps={WORKFLOW_STEPS}
        showCta={false}
      />

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="After signing"
            title={
              <>
                What happens{' '}
                <LandingGradientText>after signing?</LandingGradientText>
              </>
            }
            description="Completed documents are saved to your private document library. Connect Google Drive in Settings to mirror signed PDFs automatically."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {AFTER_SIGNING.map((item) => (
              <article
                key={item.number}
                className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-4 right-5 text-4xl font-bold leading-none text-muted-foreground/15"
                >
                  {item.number}
                </span>
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xl',
                    item.iconBg,
                  )}
                >
                  <item.icon
                    className={cn('size-6', item.iconColor)}
                    strokeWidth={1.75}
                  />
                </div>
                <p className="relative mt-6 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaSection
        title={
          <>
            Walk through the workflow{' '}
            <span className="text-blue-600 dark:text-blue-400">yourself</span>
          </>
        }
        description="Open the budget planner, generate a PDF, and see how signing and storage fit together."
        benefits={[]}
        primaryLabel="Try it free"
      />
    </>
  )
}
