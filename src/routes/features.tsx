import { createFileRoute } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LANDING_FEATURES } from '#/components/landing/landing-content'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'
import { MARKETING_CAPABILITIES } from '#/lib/marketing/tools'
import { cn } from '#/lib/utils'

const FEATURE_STYLES = [
  {
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
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

export const Route = createFileRoute('/features')({
  head: () =>
    buildPageHead({
      title: `Features | ${APP_NAME} — ${APP_TAGLINE}`,
      description:
        'AI logo designer, AI product video generator, and AI image generator in one Kixi workspace for designers.',
      path: '/features',
      image: '/hero-banner.png',
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
            A creative studio for{' '}
            <LandingGradientText>designers</LandingGradientText>
          </>
        }
        description={`${APP_NAME} combines an AI landing page creator, an AI logo designer, an AI product video generator, and an AI image generator so you can ship files — not a pile of prompts.`}
        primaryCta={{ label: `Open ${APP_NAME}`, href: '/ai-image-designer' }}
      />

      <section className="bg-background py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="Capabilities"
            title={
              <>
                Core tools in{' '}
                <LandingGradientText>{APP_NAME}</LandingGradientText>
              </>
            }
            description="Four generation studios plus the controls designers actually use: themes, palettes, canvases, variants, and downloads."
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
            eyebrow="For designers"
            title={
              <>
                Built to{' '}
                <LandingGradientText>ship files</LandingGradientText>
              </>
            }
            description="Same theme and layout across landing pages, logo, video, and image — so you stay in flow."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {MARKETING_CAPABILITIES.map((item, index) => (
              <CapabilityCard
                key={item.title}
                number={String(index + 1).padStart(2, '0')}
                icon={item.icon}
                iconBg={FEATURE_STYLES[index]!.iconBg}
                iconColor={FEATURE_STYLES[index]!.iconColor}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      <LandingCtaSection
        title={
          <>
            See the tools in{' '}
            <span className="text-blue-600 dark:text-blue-400">{APP_NAME}</span>
          </>
        }
        description="Open the live demo and generate a landing page, a logo, a product clip, or marketplace stills."
        benefits={[]}
        primaryLabel={`Open ${APP_NAME}`}
        primaryHref="/ai-image-designer"
      />
    </>
  )
}
