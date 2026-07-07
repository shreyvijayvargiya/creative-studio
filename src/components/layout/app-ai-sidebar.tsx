import { Bot, History, PanelRight, PanelRightClose, X } from 'lucide-react'

import { DashboardAiAssistant } from '#/components/dashboard/dashboard-ai-assistant'
import { useDashboardAiPanel } from '#/components/dashboard/dashboard-ai-panel-provider'
import { Button } from '#/components/ui/button'
import { Sheet, SheetContent } from '#/components/ui/sheet'
import { cn } from '#/lib/utils'

const PANEL_HEIGHT = 'h-[calc(100svh-1rem)]'

function AiSidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-4 py-4">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        </div>
        <p className="pl-10 text-xs text-muted-foreground">
          Finance CRM &amp; accounting help
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          disabled
          aria-label="Chat history"
        >
          <History className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={onClose}
          aria-label="Close assistant panel"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function AiSidebarBody() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardAiAssistant variant="panel" />
    </div>
  )
}

export function AppAiSidebarDesktop() {
  const { isOpen, close } = useDashboardAiPanel()

  return (
    <div
      className={cn(
        'hidden shrink-0 self-start transition-[width] duration-300 ease-in-out lg:block',
        isOpen ? 'w-[22rem]' : 'w-0 overflow-hidden',
      )}
    >
      <aside
        className={cn(
          'crm-sidebar sticky top-2 flex w-[22rem] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm',
          PANEL_HEIGHT,
          !isOpen && 'pointer-events-none opacity-0',
        )}
        aria-label="AI assistant"
        aria-hidden={!isOpen}
      >
        {isOpen ? (
          <>
            <AiSidebarHeader onClose={close} />
            <AiSidebarBody />
          </>
        ) : null}
      </aside>
    </div>
  )
}

export function AppAiSidebarMobile({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(100vw,22rem)] flex-col rounded-l-xl border-border bg-background p-0"
      >
        <AiSidebarHeader onClose={() => onOpenChange(false)} />
        <AiSidebarBody />
      </SheetContent>
    </Sheet>
  )
}

export function AppAiSidebarToggle({
  className,
  onMobileOpen,
}: {
  className?: string
  onMobileOpen?: () => void
}) {
  const { isOpen, open, close } = useDashboardAiPanel()

  const handleClick = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      onMobileOpen?.()
      return
    }
    if (isOpen) close()
    else open()
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('text-muted-foreground', className)}
      onClick={handleClick}
      aria-label={isOpen ? 'Close assistant panel' : 'Open assistant panel'}
    >
      {isOpen ? (
        <PanelRightClose className="size-5" />
      ) : (
        <PanelRight className="size-5" />
      )}
    </Button>
  )
}
