import { createFileRoute } from '@tanstack/react-router'
import { Clapperboard, Hexagon, ImageIcon, LayoutTemplate } from 'lucide-react'

import { LandingCtaSection } from '#/components/landing/landing-cta-section'
import {
  LandingGradientText,
  LandingSectionHeading,
} from '#/components/landing/landing-section-heading'
import { LandingSubpageHero } from '#/components/landing/landing-subpage-hero'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'

const STUDIO_ITEMS = [
  { icon: LayoutTemplate, label: 'AI landing page creator — themed React, Vite, Next.js, or HTML' },
  { icon: Hexagon, label: 'AI logo designer — original SVG marks in 24 styles' },
  { icon: Clapperboard, label: 'AI product video generator — short MP4 clips from stills' },
  { icon: ImageIcon, label: 'AI image generator — marketplace stills from 1–3 photos' },
] as const

export const Route = createFileRoute('/about')({
  head: () =>
    buildPageHead({
      title: `About | ${APP_NAME} — ${APP_TAGLINE}`,
      description: `${APP_NAME} is a creative studio for designers: AI landing pages, logos, product videos, and images in one workspace.`,
      path: '/about',
      image: '/hero-banner.png',
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
            {APP_NAME} is a{' '}
            <LandingGradientText>{APP_TAGLINE.toLowerCase()}</LandingGradientText>
          </>
        }
        description="We built Kixi so designers can generate logos, product videos, and product images without jumping between five tools."
        primaryCta={{ label: `Open ${APP_NAME}`, href: '/ai-image-designer' }}
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
                description="Listing photos, brand marks, and short product clips usually live in different apps. Kixi keeps them in one studio with the same brief and downloads."
                className="mb-6"
              />
              <p className="text-sm leading-7 text-muted-foreground">
                Each tool is opinionated: logos come back as original SVG, videos as a
                short MP4, images as sized stills. Optional references are inspiration —
                not a trace of a photograph.
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
                <Hexagon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                Four studios, one workspace
              </h3>
              <ul className="mt-4 space-y-3">
                {STUDIO_ITEMS.map((item) => (
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
            description="Questions about the studios, partnerships, or the live demo? Send a message."
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
                  placeholder="you@studio.com"
                  className="h-11 rounded-full"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <textarea
                id="contact-message"
                placeholder="Tell us about your project..."
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
              This form is a preview. Wire to email in a future release.
            </p>
          </form>
        </div>
      </section>

      <LandingCtaSection
        title={
          <>
            Open {APP_NAME} and{' '}
            <span className="text-blue-600 dark:text-blue-400">start generating</span>
          </>
        }
        description="Try the AI logo designer, product video generator, and image generator in the live demo."
        benefits={[]}
        primaryLabel={`Open ${APP_NAME}`}
        primaryHref="/ai-image-designer"
      />
    </>
  )
}
