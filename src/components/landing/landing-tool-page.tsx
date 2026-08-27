import { Link } from '@tanstack/react-router'
import { ArrowRight, Check } from 'lucide-react'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { Button } from '#/components/ui/button'
import { APP_NAME } from '#/lib/brand'
import type { MarketingTool } from '#/lib/marketing/tools'
import { MARKETING_TOOLS } from '#/lib/marketing/tools'
import { cn } from '#/lib/utils'

interface LandingToolPageProps {
  tool: MarketingTool
}

export function LandingToolPage({ tool }: LandingToolPageProps) {
  const Icon = tool.icon
  const others = MARKETING_TOOLS.filter((item) => item.id !== tool.id)

  return (
    <>
      <LandingSubpageHero
        eyebrow={tool.eyebrow}
        title={tool.headline}
        description={tool.description}
        primaryCta={{ label: tool.ctaLabel, href: tool.path }}
      />

      <section className="bg-background py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow={tool.name}
            title={
              <>
                What you get in{' '}
                <LandingGradientText>{APP_NAME}</LandingGradientText>
              </>
            }
            description={`${tool.shortName} lives in the same studio as the other Kixi tools — same theme, same brief, files you can download.`}
          />

          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-xl',
                  tool.iconBg,
                )}
              >
                <Icon className={cn('size-6', tool.iconColor)} strokeWidth={1.75} />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                Built for shipping, not demos
              </h3>
              <ul className="mt-4 space-y-3">
                {tool.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-8 h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
              >
                <Link to={tool.path}>
                  {tool.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>

            <div className="grid gap-4">
              {others.map((item) => {
                const OtherIcon = item.icon
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl',
                        item.iconBg,
                      )}
                    >
                      <OtherIcon
                        className={cn('size-5', item.iconColor)}
                        strokeWidth={1.75}
                      />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.headline}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <LandingCtaSection
        badge="Live demo ready"
        title={
          <>
            Try the {tool.shortName.toLowerCase()} studio in{' '}
            <span className="text-blue-600 dark:text-blue-400">{APP_NAME}</span>
          </>
        }
        description={tool.description}
        benefits={[]}
        primaryLabel={tool.ctaLabel}
        primaryHref={tool.path}
        footer="Free to try · No credit card required"
      />
    </>
  )
}
