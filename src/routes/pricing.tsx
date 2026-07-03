import { createFileRoute } from '@tanstack/react-router'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LANDING_FAQ, LANDING_PRICING_TIERS } from '#/components/landing/landing-content'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { PricingCard } from '#/components/landing/pricing-card'

export const Route = createFileRoute('/pricing')({
  head: () => ({
    meta: [
      { title: 'Pricing | Finance CRM — Free & Pro Plans' },
      {
        name: 'description',
        content:
          'Simple pricing for accounting teams. Start free with budget planning and PDF signing. Pro and Team plans with Google Drive sync coming soon.',
      },
    ],
  }),
  component: PricingPage,
})

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string
  answer: string
  index: number
}) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm dark:bg-card">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
          {number}
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">{question}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  )
}

function PricingPage() {
  return (
    <>
      <LandingSubpageHero
        eyebrow="Pricing"
        title={
          <>
            Start free. Upgrade when your{' '}
            <LandingGradientText>practice grows</LandingGradientText>.
          </>
        }
        description="Transparent plans for solo bookkeepers and growing firms. Payment checkout via Stripe and PayPal will be added in a future release."
        primaryCta={{ label: 'Get started free', href: '/dashboard' }}
      />

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="Plans"
            title={
              <>
                Choose the right{' '}
                <LandingGradientText>plan</LandingGradientText> for you
              </>
            }
            description="Start on the free tier today. Upgrade when you need Drive sync and higher limits."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {LANDING_PRICING_TIERS.map((tier, index) => (
              <PricingCard key={tier.name} tier={tier} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="FAQ"
            title={
              <>
                Frequently asked{' '}
                <LandingGradientText>questions</LandingGradientText>
              </>
            }
            description="Common questions about plans, storage, and upcoming payment options."
          />

          <div className="space-y-4">
            {LANDING_FAQ.map((item, index) => (
              <FaqItem key={item.question} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <LandingCtaSection
        badge="No credit card required"
        title={
          <>
            Use the free tier{' '}
            <span className="text-violet-600 dark:text-violet-400">today</span>
          </>
        }
        description="Create documents, sign PDFs, and explore the full workflow while paid plans roll out."
        benefits={[]}
        primaryLabel="Create free account"
        footer="Free to start · Upgrade anytime"
      />
    </>
  )
}
