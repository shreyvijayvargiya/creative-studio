import type { HomeInsideFeature } from '#/components/landing/landing-inside-content'
import { cn } from '#/lib/utils'

interface WhatsInsideFeatureCardProps {
  feature: HomeInsideFeature
}

export function WhatsInsideFeatureCard({ feature }: WhatsInsideFeatureCardProps) {
  const Icon = feature.icon

  return (
    <article className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 right-5 select-none text-5xl font-bold leading-none text-muted-foreground/15 sm:text-6xl"
      >
        {feature.number}
      </span>

      <div
        className={cn(
          'relative flex size-12 items-center justify-center rounded-xl',
          feature.iconBg,
        )}
      >
        <Icon className={cn('size-6', feature.iconColor)} strokeWidth={1.75} />
      </div>

      <h3 className="relative mt-6 text-lg font-semibold tracking-tight text-foreground">
        {feature.title}
      </h3>
      <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
        {feature.description}
      </p>
    </article>
  )
}

interface LandingWhatsInsideSectionProps {
  features: HomeInsideFeature[]
}

export function LandingWhatsInsideSection({
  features,
}: LandingWhatsInsideSectionProps) {
  return (
    <section className="relative bg-background py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="mb-4 flex items-center justify-center gap-2 sm:mb-5 sm:gap-4">
            <div className="hidden h-px w-6 bg-border min-[400px]:block sm:w-16" />
            <p className="text-[10px] font-semibold tracking-[0.15em] text-violet-600 uppercase min-[400px]:text-xs min-[400px]:tracking-[0.2em] dark:text-violet-400">
              What&apos;s inside
            </p>
            <div className="hidden h-px w-6 bg-border min-[400px]:block sm:w-16" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
            Everything an{' '}
            <span className="bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              accounting practice
            </span>{' '}
            needs
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
            One workspace. Every workflow. Budget planning, ATO PDFs, e-signing,
            and secure storage — curated for accountants and bookkeepers.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <WhatsInsideFeatureCard key={feature.number} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
