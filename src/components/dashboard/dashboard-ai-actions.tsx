import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { AiAssistantToolAction } from '#/types/ai'

export function DashboardAiActionLink({
  action,
  className,
}: {
  action: AiAssistantToolAction
  className?: string
}) {
  return (
    <Button
      asChild
      variant="secondary"
      size="sm"
      className={cn(
        'h-7 gap-1.5 rounded-full bg-violet-50 px-2.5 text-xs font-normal text-violet-700 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-950/70',
        className,
      )}
    >
      <Link to={action.to} params={action.params} search={action.search}>
        {action.label}
      </Link>
    </Button>
  )
}

export function navigateToAiAction(
  navigate: ReturnType<typeof useNavigate>,
  action: AiAssistantToolAction,
) {
  void navigate({
    to: action.to,
    params: action.params,
    search: action.search,
  })
}
