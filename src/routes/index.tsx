import { createFileRoute } from '@tanstack/react-router'
import { HOME_INSIDE_FEATURES } from '#/components/landing/landing-inside-content'
import { LANDING_STEPS } from '#/components/landing/landing-content'
import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import { LandingHomeHero } from '#/components/landing/landing-home-hero'
import { LandingWhatsInsideSection } from '#/components/landing/landing-whats-inside'
import { LandingWorkflowSection } from '#/components/landing/landing-workflow-section'
import { buildPageMetaTags } from '#/lib/blog/seo'
import { LandingGradientText } from '#/components/landing/landing-section-heading'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: buildPageMetaTags({
      title: 'Finance CRM | Accounting Software for Budgets, Tax PDFs & E-Sign',
      description:
        'Modern accounting CRM for small business. Plan budgets, generate ATO tax PDFs, e-sign documents, and sync to Google Drive — all in one workspace.',
      path: '/',
    }),
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <LandingHomeHero />

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

      <LandingCtaSection
        title={
          <>
            Run your practice from{' '}
            <span className="text-blue-600 dark:text-blue-400">one workspace</span>
          </>
        }
        description="Plan budgets, generate ATO-ready PDFs, collect e-signatures, and store client documents securely — free to start."
      />
    </>
  )
}
