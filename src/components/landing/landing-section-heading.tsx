import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

interface LandingSectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: string
  className?: string
  align?: 'center' | 'left'
}

export function LandingSectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = 'center',
}: LandingSectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-12 max-w-3xl sm:mb-14',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <div
        className={cn(
          'mb-5 flex items-center gap-4',
          align === 'center' && 'justify-center',
        )}
      >
        <div className="h-px w-10 bg-border sm:w-16" />
        <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
          {eyebrow}
        </p>
        <div className="h-px w-10 bg-border sm:w-16" />
      </div>

      <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            'mt-5 text-base leading-7 text-muted-foreground sm:text-lg',
            align === 'center' && 'mx-auto max-w-2xl',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function LandingGradientText({ children }: { children: ReactNode }) {
  return (
    <span className="bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
      {children}
    </span>
  )
}
