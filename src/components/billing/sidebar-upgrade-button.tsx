import { Sparkles } from 'lucide-react'

import { useSubscribeModal } from '#/components/billing/subscribe-modal-provider'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface SidebarUpgradeButtonProps {
  className?: string
}

export function SidebarUpgradeButton({ className }: SidebarUpgradeButtonProps) {
  const { openSubscribeModal } = useSubscribeModal()

  return (
    <Button
      type="button"
      className={cn('w-full gap-2 bg-primary hover:bg-primary/90', className)}
      onClick={openSubscribeModal}
    >
      <Sparkles className="size-4" />
      Upgrade plan
    </Button>
  )
}
