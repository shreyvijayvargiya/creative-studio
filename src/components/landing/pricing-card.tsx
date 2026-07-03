import { useLoginModal } from '#/components/auth/login-modal-provider'
import type { PricingTier } from '#/components/landing/landing-content'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface PricingCardProps {
  tier: PricingTier
  index: number
}

const TIER_ACCENTS = [
  'border-border/60',
  'border-violet-300 ring-2 ring-violet-500/20 dark:border-violet-500/40',
  'border-border/60',
]

export function PricingCard({ tier, index }: PricingCardProps) {
  const { openLoginModal } = useLoginModal()
  const number = String(index + 1).padStart(2, '0')

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6',
        tier.highlighted
          ? 'border-violet-300 bg-linear-to-b from-violet-50/80 to-white dark:from-violet-950/20 dark:to-card'
          : TIER_ACCENTS[index] ?? 'border-border/60',
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 right-5 select-none text-5xl font-bold leading-none text-muted-foreground/15"
      >
        {number}
      </span>

      <div className="relative">
        <p
          className={cn(
            'text-xs font-semibold tracking-[0.15em] uppercase',
            tier.highlighted
              ? 'text-violet-600 dark:text-violet-400'
              : 'text-muted-foreground',
          )}
        >
          {tier.name}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            {tier.price}
          </span>
          <span className="text-sm text-muted-foreground">{tier.period}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {tier.description}
        </p>
      </div>

      <ul className="relative mt-6 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-sm leading-5 text-muted-foreground"
          >
            <span className="text-violet-500" aria-hidden>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        className={cn(
          'relative mt-8 h-11 w-full rounded-full',
          tier.highlighted
            ? 'bg-violet-600 text-white hover:bg-violet-700'
            : 'border border-border bg-white hover:bg-muted',
        )}
        variant={tier.highlighted ? 'default' : 'outline'}
        onClick={openLoginModal}
      >
        {tier.cta}
      </Button>
    </article>
  )
}
