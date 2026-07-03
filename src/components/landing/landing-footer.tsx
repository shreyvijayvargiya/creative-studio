import { Link } from '@tanstack/react-router'

import { LANDING_NAV_LINKS } from '#/components/landing/landing-content'
import { LandingLogo } from '#/components/landing/landing-logo'

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <LandingLogo />
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Modern accounting software for budget planning, ATO tax PDFs,
              e-signing, and secure document management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/grid"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Budget planner
                  </Link>
                </li>
                <li>
                  <Link
                    to="/documents"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Documents
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="landing-label mb-3 text-foreground">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy policy</li>
                <li>Terms of service</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {year} Finance CRM. Built for accounting professionals.
        </div>
      </div>
    </footer>
  )
}
