import { Link } from '@tanstack/react-router'

import { LANDING_NAV_LINKS } from '#/components/landing/landing-content'
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
              Modern accounting software for budget planning, ATO tax PDFs,
              e-signing, and secure document management.
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
            <div className="col-span-2 sm:col-span-1">
              <p className="landing-label mb-3 text-foreground">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy policy</li>
                <li>Terms of service</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground sm:mt-10 sm:text-left">
          © {year} Finance CRM. Built for accounting professionals.
        </div>
      </div>
    </footer>
  )
}
