import { createFileRoute } from '@tanstack/react-router'

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
import { APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'
import { MARKETING_TOOLS } from '#/lib/marketing/tools'
import { cn } from '#/lib/utils'

const WORKFLOW_STEPS: WorkflowStepItem[] = LANDING_STEPS.map((step, index) => ({
  ...step,
  extra:
    index === 1
      ? 'A prompt is enough. Add a brand name for logos, pick a design theme for landing pages, or drop in images as inspiration.'
      : index === 2
        ? 'Landing pages return one themed page you can update in chat. Logo runs 24 styles in parallel. Video returns one short MP4. Images return 3–10 variants at the canvas you picked.'
        : undefined,
}))

const TOOL_OUTCOMES = MARKETING_TOOLS.map((tool, index) => ({
  number: String(index + 1).padStart(2, '0'),
  icon: tool.icon,
  iconBg: tool.iconBg,
  iconColor: tool.iconColor,
  text: `${tool.name}: ${tool.highlights[0]}.`,
}))

export const Route = createFileRoute('/how-it-works')({
  head: () =>
    buildPageHead({
      title: `How It Works | ${APP_NAME} ${APP_TAGLINE}`,
      description: `See how ${APP_NAME} turns a brief into landing pages, logos, product videos, and images — upload or describe, generate, download.`,
      path: '/how-it-works',
      image: '/hero-banner.png',
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
            Brief in.{' '}
            <LandingGradientText>Files out.</LandingGradientText>
          </>
        }
        description={`${APP_NAME} connects prompt, optional references, generation, and download for logos, product videos, and images.`}
        primaryCta={{ label: `Open ${APP_NAME}`, href: '/ai-image-designer' }}
      />

      <LandingWorkflowSection
        eyebrow="The workflow"
        title={
          <>
            The complete{' '}
            <LandingGradientText>workflow</LandingGradientText>
          </>
        }
        description="Each step is the same across tools so you can switch studios without relearning the UI."
        steps={WORKFLOW_STEPS}
        showCta={false}
      />

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="What you download"
            title={
              <>
                Three tools,{' '}
                <LandingGradientText>three file types</LandingGradientText>
              </>
            }
            description="Vector logos, short MP4 clips, and marketplace stills — ready for a brand kit or a listing."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {TOOL_OUTCOMES.map((item) => (
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
        description={`Open ${APP_NAME} and generate a logo, a product clip, or a set of stills.`}
        benefits={[]}
        primaryLabel={`Open ${APP_NAME}`}
        primaryHref="/ai-image-designer"
      />
    </>
  )
}
