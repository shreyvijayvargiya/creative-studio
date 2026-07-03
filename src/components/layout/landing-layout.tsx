import { LandingFooter } from '#/components/landing/landing-footer'
import { LandingNav } from '#/components/landing/landing-nav'

interface LandingLayoutProps {
  children: React.ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="landing-page relative flex min-h-svh flex-col bg-background font-sans text-foreground">
      <LandingNav />
      <main className="flex-1 relative">{children}</main>
      <LandingFooter />
    </div>
  )
}
