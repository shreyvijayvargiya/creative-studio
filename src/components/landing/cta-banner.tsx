import { Link } from '@tanstack/react-router'

import { useLoginModal } from '#/components/auth/login-modal-provider'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface CtaBannerProps {
  title: string
  description: string
  primaryLabel?: string
  primaryHref?: string
  className?: string
}

export function CtaBanner({
  title,
  description,
  primaryLabel = 'Get started free',
  primaryHref = '/dashboard',
  className,
}: CtaBannerProps) {
  const { openLoginModal } = useLoginModal()

  return (
    <section className={cn('bg-[#FAFAFA] py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-border bg-white p-8 text-center sm:p-12">
          <h2 className="landing-headline-md text-foreground">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="h-10 rounded-full px-5">
              <Link to={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-full px-5 text-sm underline-offset-4 hover:underline"
              onClick={openLoginModal}
            >
              Sign in to your account
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
