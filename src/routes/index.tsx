import { createFileRoute } from '@tanstack/react-router'
// DEMO: finance sections commented — restore later
// import { HOME_INSIDE_FEATURES } from '#/components/landing/landing-inside-content'
// import { LANDING_STEPS } from '#/components/landing/landing-content'
// import { LandingWhatsInsideSection } from '#/components/landing/landing-whats-inside'
// import { LandingWorkflowSection } from '#/components/landing/landing-workflow-section'
// import { LandingGradientText } from '#/components/landing/landing-section-heading'
import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LandingHomeHero } from '#/components/landing/landing-home-hero'
import { buildPageMetaTags } from '#/lib/blog/seo'
import {
  ImageIcon,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: buildPageMetaTags({
      // DEMO: was Finance CRM meta
      title: 'Creative Studio | AI Product Photos for Etsy, Shopify & Social',
      description:
        'Turn one product photo into Etsy, Shopify, Instagram, and Pinterest creatives. AI design assets for ecommerce brands — try the live demo.',
      path: '/',
    }),
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <LandingHomeHero />

      {/* DEMO: Finance CRM sections hidden for Creative Studio launch
      <LandingWhatsInsideSection features={HOME_INSIDE_FEATURES} />
      <LandingWorkflowSection
        steps={[...LANDING_STEPS]}
        title={
          <>
            Start your <LandingGradientText>workflow</LandingGradientText> in 4
            steps
          </>
        }
        description="A straightforward path your team and clients can follow without training manuals."
      />
      */}

      <LandingCtaSection
        badge="Live demo ready"
        title={
          <>
            Ready to generate your next{' '}
            <span className="text-blue-600 dark:text-blue-400">product creatives</span>
            ?
          </>
        }
        description="Upload a product photo, pick a marketplace format and style, and download Etsy-, Shopify-, and social-ready assets in minutes."
        primaryLabel="Open Creative Studio"
        primaryHref="/creative-studio"
        footer="Demo · Sign in to generate · No credit card required"
        benefits={[
          {
            icon: Sparkles,
            label: 'AI scenes from a single product photo',
            iconBg: 'bg-blue-100 dark:bg-blue-950/50',
            iconColor: 'text-blue-600 dark:text-blue-400',
          },
          {
            icon: ShoppingBag,
            label: 'Sized for Etsy, Shopify, IG & Pinterest',
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            icon: ImageIcon,
            label: '3–10 variants with styles & colour palettes',
            iconBg: 'bg-orange-100 dark:bg-orange-950/50',
            iconColor: 'text-orange-600 dark:text-orange-400',
          },
          {
            icon: Zap,
            label: 'Compare before/after and download instantly',
            iconBg: 'bg-teal-100 dark:bg-teal-950/50',
            iconColor: 'text-teal-600 dark:text-teal-400',
          },
        ]}
      />
    </>
  )
}
