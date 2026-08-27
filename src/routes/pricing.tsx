import { createFileRoute } from '@tanstack/react-router'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LANDING_FAQ, LANDING_PRICING_TIERS } from '#/components/landing/landing-content'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { PricingCard } from '#/components/landing/pricing-card'
import { APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'

export const Route = createFileRoute('/pricing')({
  head: () =>
    buildPageHead({
      title: `Pricing | ${APP_NAME} — ${APP_TAGLINE}`,
      description: `Simple plans for ${APP_NAME}. Try the AI logo designer, product video generator, and image generator free, then scale when you need more volume.`,
      path: '/pricing',
      image: '/hero-banner.png',
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
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
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
            <LandingGradientText>studio grows</LandingGradientText>.
          </>
        }
        description={`Transparent plans for designers using ${APP_NAME}. Payment checkout via Stripe and PayPal will be added in a future release.`}
        primaryCta={{ label: `Open ${APP_NAME}`, href: '/ai-image-designer' }}
      />

      <section className="bg-background py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="Plans"
            title={
              <>
                Choose the right{' '}
                <LandingGradientText>plan</LandingGradientText> for you
              </>
            }
            description="Start on the free demo today. Upgrade when you need higher generation limits."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_PRICING_TIERS.map((tier, index) => (
              <PricingCard key={tier.name} tier={tier} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-24">
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
            <span className="text-blue-600 dark:text-blue-400">today</span>
          </>
        }
        description={`Open ${APP_NAME} and generate a logo, product clip, or stills while paid plans roll out.`}
        benefits={[]}
        primaryLabel={`Open ${APP_NAME}`}
        primaryHref="/ai-image-designer"
        footer="Free to start · Upgrade anytime"
      />
    </>
  )
}
