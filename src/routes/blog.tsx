import { createFileRoute } from '@tanstack/react-router'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'

const BLOG_POSTS = [
  {
    title: 'How Australian practices are digitising client workflows',
    excerpt:
      'Why budget planning, ATO PDFs, and e-signing belong in one workspace — not five disconnected tools.',
    date: 'Coming soon',
  },
  {
    title: 'A calmer way to collect signatures from clients',
    excerpt:
      'Embedded DocuSeal signing keeps clients in your branded experience without email ping-pong.',
    date: 'Coming soon',
  },
  {
    title: 'Google Drive backup without the shared service account trap',
    excerpt:
      'Per-user OAuth means your storage quota, your folders, and your control.',
    date: 'Coming soon',
  },
] as const

export const Route = createFileRoute('/blog')({
  head: () => ({
    meta: [
      { title: 'Blog | Finance CRM — Accounting Practice Insights' },
      {
        name: 'description',
        content:
          'Articles on accounting workflows, ATO PDF preparation, e-signing, and modern practice operations.',
      },
    ],
  }),
  component: BlogPage,
})

function BlogPage() {
  return (
    <>
      <LandingSubpageHero
        eyebrow="Blog"
        title={
          <>
            Insights for modern{' '}
            <LandingGradientText>accounting practices</LandingGradientText>
          </>
        }
        description="Practical notes on budgets, tax PDFs, client signing, and running a calmer finance workspace."
        primaryCta={{ label: 'Get started free', href: '/dashboard' }}
      />

      <section className="bg-background py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="Latest"
            title={
              <>
                Articles{' '}
                <LandingGradientText>coming soon</LandingGradientText>
              </>
            }
            description="We're preparing guides for bookkeepers and tax agents. Check back for workflow tips and product updates."
          />

          <div className="space-y-4">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.title}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6"
              >
                <p className="text-xs font-medium tracking-wide text-violet-600 uppercase dark:text-violet-400">
                  {post.date}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaSection
        title={
          <>
            Start your practice workflow{' '}
            <span className="text-violet-600 dark:text-violet-400">today</span>
          </>
        }
        description="Everything on the home page — budgets, ATO PDFs, e-signing, and storage — is free to try."
        benefits={[]}
        primaryLabel="Open workspace"
      />
    </>
  )
}
