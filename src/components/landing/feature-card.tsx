import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { cn } from '#/lib/utils'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'rounded-sm border border-border bg-[#FAFAFA] shadow-none',
        className,
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex size-10 items-center justify-center rounded-sm border border-border bg-white">
          <Icon className="size-5 text-foreground" strokeWidth={1.5} />
        </div>
        <CardTitle className="landing-headline-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
