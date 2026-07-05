import { Link } from '@tanstack/react-router'

import { useLoginModal } from '#/components/auth/login-modal-provider'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface LandingHeroProps {
  eyebrow?: string
  title: string
  description: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; onClick?: () => void; href?: string }
  className?: string
}

export function LandingHero({
  eyebrow,
  title,
  description,
  primaryCta = { label: 'Get started free', href: '/dashboard' },
  secondaryCta,
  className,
}: LandingHeroProps) {
  const { openLoginModal } = useLoginModal()

  return (
    <section
      className={cn(
        'border-b border-border bg-[#FAFAFA] pt-28 pb-20 sm:pb-24 lg:pb-28',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? (
            <p className="landing-label mb-4 text-muted-foreground">{eyebrow}</p>
          ) : null}
          <h1 className="landing-headline-display text-foreground">{title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-6 text-muted-foreground sm:text-lg sm:leading-7">
            {description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="h-10 rounded-full px-5">
              <Link to={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            {secondaryCta ? (
              secondaryCta.href ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-full border-border bg-white px-5 hover:bg-muted"
                >
                  <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-border bg-white px-5 hover:bg-muted"
                  onClick={secondaryCta.onClick ?? openLoginModal}
                >
                  {secondaryCta.label}
                </Button>
              )
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full border-border bg-white px-5 hover:bg-muted"
                onClick={openLoginModal}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
