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
        'mb-10 max-w-3xl sm:mb-14',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'text-left max-sm:mx-auto max-sm:text-center',
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center gap-2 sm:mb-5 sm:gap-4',
          align === 'center' && 'justify-center',
          align === 'left' && 'max-sm:justify-center',
        )}
      >
        <div className="hidden h-px w-6 bg-border min-[400px]:block sm:w-16" />
        <p className="text-[10px] font-semibold tracking-[0.15em] text-violet-600 uppercase min-[400px]:text-xs min-[400px]:tracking-[0.2em] dark:text-violet-400">
          {eyebrow}
        </p>
        <div className="hidden h-px w-6 bg-border min-[400px]:block sm:w-16" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            'mt-4 text-sm leading-7 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7 lg:text-lg',
            align === 'center' && 'mx-auto max-w-2xl',
            align === 'left' && 'max-sm:mx-auto max-sm:max-w-2xl',
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
