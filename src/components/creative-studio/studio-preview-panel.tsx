import type { LucideIcon } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

interface StudioPreviewPanelProps {
  icon: LucideIcon
  emptyLabel: string
  loading: boolean
  loadingLabel: string
  children?: ReactNode
  className?: string
}

export function StudioPreviewPanel({
  icon: Icon,
  emptyLabel,
  loading,
  loadingLabel,
  children,
  className,
}: StudioPreviewPanelProps) {
  const showResults = Boolean(children) && !loading

  return (
    <div
      className={cn(
        'flex min-h-[420px] flex-col overflow-hidden rounded-xl border bg-card',
        className,
      )}
    >
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="max-w-xs text-sm text-muted-foreground">{loadingLabel}</p>
        </div>
      ) : showResults ? (
        <div className="flex-1 p-4 sm:p-5">{children}</div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      )}
    </div>
  )
}
