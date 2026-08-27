import { Link } from '@tanstack/react-router'

import { LANDING_LEGAL_LINKS, LANDING_NAV_LINKS } from '#/components/landing/landing-content'
import { LandingLogo } from '#/components/landing/landing-logo'
import { APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { MARKETING_TOOLS } from '#/lib/marketing/tools'

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-10">
          <div className="space-y-4">
            <LandingLogo />
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              {APP_NAME} is a {APP_TAGLINE.toLowerCase()} — AI landing pages, logos, product
              videos, and images in one workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            <div>
              <p className="landing-label mb-3 text-foreground">Product</p>
              <ul className="space-y-2">
                {LANDING_NAV_LINKS.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      to={link.href}
                      hash={'hash' in link ? link.hash : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="landing-label mb-3 text-foreground">Tools</p>
              <ul className="space-y-2">
                {MARKETING_TOOLS.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      to={tool.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="landing-label mb-3 text-foreground">Legal</p>
              <ul className="space-y-2">
                {LANDING_LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="/rss.xml"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    RSS
                  </a>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-10 sm:flex-row">
          <p>
            © {year} {APP_NAME}. {APP_TAGLINE}.
          </p>
          <div className="flex items-center gap-4">
            {LANDING_LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
