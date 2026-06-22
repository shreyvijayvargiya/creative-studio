import { Alert, AlertDescription } from '#/components/ui/alert'

interface PhaseTwoPlaceholderProps {
  children: React.ReactNode
}

export function PhaseTwoPlaceholder({ children }: PhaseTwoPlaceholderProps) {
  return (
    <div className="relative">
      <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        <AlertDescription>This module is coming in Phase 2</AlertDescription>
      </Alert>
      <div className="pointer-events-none opacity-50">{children}</div>
    </div>
  )
}
