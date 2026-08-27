import { createFileRoute } from '@tanstack/react-router'
import { Clapperboard, Hexagon, ImageIcon, Sparkles } from 'lucide-react'

import { HOME_INSIDE_FEATURES } from '#/components/landing/landing-inside-content'
import { LANDING_STEPS } from '#/components/landing/landing-content'
import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LandingHomeHero } from '#/components/landing/landing-home-hero'
import { LandingGradientText } from '#/components/landing/landing-section-heading'
import { LandingWhatsInsideSection } from '#/components/landing/landing-whats-inside'
import { LandingWorkflowSection } from '#/components/landing/landing-workflow-section'
import { APP_DESCRIPTION, APP_NAME, APP_STUDIO_HREF, APP_TAGLINE } from '#/lib/brand'
import { buildPageHead, buildSoftwareJsonLd } from '#/lib/blog/seo'

export const Route = createFileRoute('/')({
  head: () => ({
    ...buildPageHead({
      title: `${APP_NAME} | ${APP_TAGLINE}`,
      description: APP_DESCRIPTION,
      path: '/',
      image: '/hero-banner.png',
    }),
    scripts: [
      {
        type: 'application/ld+json',
        children: buildSoftwareJsonLd(),
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <LandingHomeHero />

      <LandingWhatsInsideSection
        id="tools"
        eyebrow="Current features"
        title={
          <>
            Three AI studios in{' '}
            <LandingGradientText>{APP_NAME}</LandingGradientText>
          </>
        }
        description="AI logo designer, AI product video generator, and AI image generator — one creative studio for designers."
        features={HOME_INSIDE_FEATURES}
      />

      <LandingWorkflowSection
        id="how-it-works"
        eyebrow="How it works"
        title={
          <>
            From brief to{' '}
            <LandingGradientText>files you can ship</LandingGradientText>
          </>
        }
        description="Pick a tool, add a prompt or references, generate, and download. No extra design suite required."
        steps={[...LANDING_STEPS]}
        ctaLabel={`Open ${APP_NAME}`}
        ctaHref={APP_STUDIO_HREF}
      />

      <LandingCtaSection
        badge="Live demo ready"
        title={
          <>
            Start in{' '}
            <span className="text-blue-600 dark:text-blue-400">{APP_NAME}</span>{' '}
            today
          </>
        }
        description="Generate an original logo, a product clip, or marketplace stills in one workspace — free to try."
        primaryLabel={`Open ${APP_NAME}`}
        primaryHref={APP_STUDIO_HREF}
        footer="Live demo · Free to try · No credit card required"
        benefits={[
          {
            icon: Hexagon,
            label: 'AI logo designer — 24 SVG styles',
            iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
            iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
          },
          {
            icon: Clapperboard,
            label: 'AI product video generator — MP4 clips',
            iconBg: 'bg-orange-100 dark:bg-orange-950/50',
            iconColor: 'text-orange-600 dark:text-orange-400',
          },
          {
            icon: ImageIcon,
            label: 'AI image designer — listing stills',
            iconBg: 'bg-blue-100 dark:bg-blue-950/50',
            iconColor: 'text-blue-600 dark:text-blue-400',
          },
          {
            icon: Sparkles,
            label: 'One studio for designers',
            iconBg: 'bg-teal-100 dark:bg-teal-950/50',
            iconColor: 'text-teal-600 dark:text-teal-400',
          },
        ]}
      />
    </>
  )
}
