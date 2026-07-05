import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

interface LandingSectionProps {
  children: ReactNode
  className?: string
  id?: string
  muted?: boolean
}

export function LandingSection({
  children,
  className,
  id,
  muted = false,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 sm:py-20 lg:py-24',
        muted ? 'bg-muted/60' : 'bg-background',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}

interface LandingSectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
}: LandingSectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-12 max-w-2xl',
        align === 'center' && 'mx-auto text-center',
      )}
    >
      {eyebrow ? (
        <p className="landing-label mb-3 text-muted-foreground ">{eyebrow}</p>
      ) : null}
      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
