import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { LANDING_LEGAL_LINKS } from '#/components/landing/landing-content'
import { buildPageHead } from '#/lib/blog/seo'

interface LegalSection {
  title: string
  content: ReactNode
}

interface LegalPageContentProps {
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
}

export function LegalPageContent({
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageContentProps) {
  return (
    <section className="bg-background pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-border/60 pb-8">
          <p className="text-xs font-semibold tracking-[0.15em] text-blue-600 uppercase dark:text-blue-400">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-border/60 pt-8 text-sm">
          <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
            Back to home
          </Link>
          {LANDING_LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function legalPageHead(title: string, description: string, path: string) {
  return buildPageHead({ title, description, path })
}
