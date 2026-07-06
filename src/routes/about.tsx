import { createFileRoute } from '@tanstack/react-router'
import { Database, FileSignature, Layers } from 'lucide-react'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

const INFRA_ITEMS = [
  { icon: Layers, label: 'TanStack Start for a fast, full-stack React experience' },
  { icon: Database, label: 'Supabase for auth, database, and private file storage' },
  { icon: FileSignature, label: 'DocuSeal for compliant embedded e-signing' },
  {
    icon: Database,
    label: 'Per-user Google Drive OAuth for optional cloud backup',
  },
] as const

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About | Finance CRM — Accounting Software for Modern Practices' },
      {
        name: 'description',
        content:
          'Finance CRM helps accounting professionals plan budgets, prepare tax PDFs, collect e-signatures, and manage client documents in one secure workspace.',
      },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      <LandingSubpageHero
        eyebrow="About"
        title={
          <>
            Accounting software that{' '}
            <LandingGradientText>respects your attention</LandingGradientText>
          </>
        }
        description="We built Finance CRM for practitioners who want fewer tabs, clearer workflows, and documents that stay organized from first draft to final signature."
        primaryCta={{ label: 'Open workspace', href: '/dashboard' }}
      />

      <section className="bg-background py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <LandingSectionHeading
                eyebrow="Our story"
                align="left"
                title={
                  <>
                    Why we{' '}
                    <LandingGradientText>built this</LandingGradientText>
                  </>
                }
                description="Small practices often stitch together spreadsheets, PDF tools, e-sign platforms, and cloud drives. Finance CRM brings those steps into one calm, monochrome interface."
                className="mb-6"
              />
              <p className="text-sm leading-7 text-muted-foreground">
                The product focuses on Australian accounting use cases — budget
                planning, ATO-oriented PDF output, and secure sharing — without
                the noise of a generic enterprise CRM. Every screen is designed
                for speed, legibility, and understated credibility.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-8">
              <span
                aria-hidden
                className="float-right text-5xl font-bold leading-none text-muted-foreground/15"
              >
                01
              </span>
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                <Layers className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                Built with modern infrastructure
              </h3>
              <ul className="mt-4 space-y-3">
                {INFRA_ITEMS.map((item) => (
                  <li
                    key={item.label}
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <item.icon className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeading
            eyebrow="Contact"
            title={
              <>
                Get in <LandingGradientText>touch</LandingGradientText>
              </>
            }
            description="Questions about onboarding, features, or partnerships? Send a message — we'll respond within two business days."
          />

          <form
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-8"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  placeholder="Your name"
                  className="h-11 rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="you@practice.com.au"
                  className="h-11 rounded-full"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <textarea
                id="contact-message"
                placeholder="Tell us about your practice or question..."
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-28 w-full rounded-2xl border px-4 py-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
            <Button
              type="submit"
              className="mt-6 h-11 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto sm:px-8"
            >
              Send message
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              This form is a preview. Wire to email or CRM in a future release.
            </p>
          </form>
        </div>
      </section>

      <LandingCtaSection
        title={
          <>
            Join accounting teams{' '}
            <span className="text-blue-600 dark:text-blue-400">
              shipping faster
            </span>
          </>
        }
        description="Create a free workspace and see how Finance CRM fits your client document workflow."
        benefits={[]}
      />
    </>
  )
}
