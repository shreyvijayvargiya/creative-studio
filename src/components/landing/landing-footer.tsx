import { Link } from '@tanstack/react-router'

import { LANDING_LEGAL_LINKS, LANDING_NAV_LINKS } from '#/components/landing/landing-content'
import { LandingLogo } from '#/components/landing/landing-logo'

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-10">
          <div className="space-y-4">
            <LandingLogo />
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              {/* DEMO: was Finance CRM accounting blurb */}
              AI creative studio for ecommerce brands — turn one product photo into
              Etsy, Shopify, Instagram, and Pinterest assets.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            <div>
              <p className="landing-label mb-3 text-foreground">Product</p>
              <ul className="space-y-2">
                {LANDING_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="landing-label mb-3 text-foreground">App</p>
              <ul className="space-y-2">
                {/* DEMO: was Dashboard / Budget / Documents */}
                <li>
                  <Link
                    to="/creative-studio"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Creative Studio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
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
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-10 sm:flex-row">
          {/* DEMO: was Finance CRM copyright */}
          <p>© {year} Creative Studio. AI assets for ecommerce brands.</p>
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
