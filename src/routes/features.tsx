import { createFileRoute } from '@tanstack/react-router'
import { Cloud, FileCheck, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LANDING_FEATURES } from '#/components/landing/landing-content'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { buildPageMetaTags } from '#/lib/blog/seo'
import { cn } from '#/lib/utils'

const FEATURE_STYLES = [
  {
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    iconBg: 'bg-teal-100 dark:bg-teal-950/50',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
] as const

const PROFESSIONAL_HIGHLIGHTS = [
  {
    number: '01',
    icon: FileCheck,
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'Audit-friendly exports',
    description:
      'Generate PDFs with structured taxpayer data and budget summaries suitable for review and filing preparation.',
  },
  {
    number: '02',
    icon: Shield,
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    title: 'Client-ready sharing',
    description:
      'PIN-protected links let you share documents without exposing your full workspace or storage bucket.',
  },
  {
    number: '03',
    icon: Cloud,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Your cloud, your quota',
    description:
      'Google Drive sync uses the connected user account — not a shared service account with storage limits.',
  },
] as const

function CapabilityCard({
  number,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  number: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
}) {
  return (
    <article className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 right-5 select-none text-5xl font-bold leading-none text-muted-foreground/15 sm:text-6xl"
      >
        {number}
      </span>

      <div
        className={cn(
          'relative flex size-12 items-center justify-center rounded-xl',
          iconBg,
        )}
      >
        <Icon className={cn('size-6', iconColor)} strokeWidth={1.75} />
      </div>

      <h3 className="relative mt-6 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  )
}

function ProfessionalHighlightCard({
  number,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  number: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
}) {
  return (
    <article className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 right-5 text-4xl font-bold leading-none text-muted-foreground/15"
      >
        {number}
      </span>

      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-xl',
          iconBg,
        )}
      >
        <Icon className={cn('size-6', iconColor)} strokeWidth={1.75} />
      </div>

      <h3 className="relative mt-6 text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  )
}

export const Route = createFileRoute('/features')({
  head: () => ({
    meta: buildPageMetaTags({
      title: 'Features | Finance CRM Accounting Software',
      description:
        'Budget planner, ATO tax PDF generation, DocuSeal e-signing, Google Drive backup, and PIN-protected document sharing for accounting teams.',
      path: '/features',
    }),
  }),
  component: FeaturesPage,
})

function FeaturesPage() {
  return (
    <>
      <LandingSubpageHero
        eyebrow="Features"
        title={
          <>
            Built for accounting{' '}
            <LandingGradientText>workflows</LandingGradientText>, not generic CRMs
          </>
        }
        description="Every feature maps to a real step in client engagement — from initial budget planning through to signed, stored, and shareable tax documents."
        primaryCta={{ label: 'Start free', href: '/dashboard' }}
      />

      <section className="bg-background py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="Capabilities"
            title={
              <>
                Core tools for{' '}
                <LandingGradientText>modern practices</LandingGradientText>
              </>
            }
            description="A focused toolkit for bookkeepers, tax agents, and small business advisers."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_FEATURES.map((feature, index) => {
              const style = FEATURE_STYLES[index % FEATURE_STYLES.length]
              const number = String(index + 1).padStart(2, '0')

              return (
                <CapabilityCard
                  key={feature.title}
                  number={number}
                  icon={feature.icon}
                  iconBg={style.iconBg}
                  iconColor={style.iconColor}
                  title={feature.title}
                  description={feature.description}
                />
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="For professionals"
            title={
              <>
                Designed for teams who value{' '}
                <LandingGradientText>precision</LandingGradientText>
              </>
            }
            description="High contrast, minimal chrome, and generous whitespace keep focus on the numbers and documents that matter."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {PROFESSIONAL_HIGHLIGHTS.map((item) => (
              <ProfessionalHighlightCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <LandingCtaSection
        title={
          <>
            See the features in your own{' '}
            <span className="text-blue-600 dark:text-blue-400">workspace</span>
          </>
        }
        description="Sign up free and walk through the budget planner, PDF generation, and signing flow today."
        benefits={[]}
        primaryLabel="Get started free"
      />
    </>
  )
}
