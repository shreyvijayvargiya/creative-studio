import { useEffect, useState } from 'react'
import { Bell, Menu, PanelLeft, PanelLeftClose, Search } from 'lucide-react'

import {
  AppAiSidebarMobile,
  AppAiSidebarToggle,
} from '#/components/layout/app-ai-sidebar'
import { SearchCommand } from '#/components/layout/search-command'
import { SidebarContent } from '#/components/layout/sidebar'
import { useSidebar } from '#/components/layout/sidebar-provider'
import { ThemeToggleButton } from '#/components/layout/theme-toggle-button'
import { TopbarUserMenu } from '#/components/layout/topbar-user-menu'
import { Button } from '#/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '#/components/ui/sheet'

export function Topbar() {
  const { collapsed, toggleSidebar } = useSidebar()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileAiOpen, setMobileAiOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <header className="z-30 flex h-14 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 sm:gap-3 sm:px-4">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-border bg-sidebar p-0 text-sidebar-foreground"
          >
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden text-muted-foreground lg:inline-flex"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <PanelLeft className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
          <span className="sr-only">
            {collapsed ? 'Open sidebar' : 'Close sidebar'}
          </span>
        </Button>

        <div className="flex min-w-0 flex-1 justify-center md:justify-start">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative flex h-9 w-full min-w-0 max-w-md items-center rounded-md border border-input bg-muted/50 px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted sm:px-3"
          >
            <Search className="mr-1.5 size-4 shrink-0 sm:mr-2" />
            <span className="min-w-0 flex-1 truncate">
              <span className="sm:hidden">Search...</span>
              <span className="hidden sm:inline">Search documents...</span>
            </span>
            <kbd className="pointer-events-none ml-1 hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggleButton className="hidden sm:inline-flex" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden text-muted-foreground sm:inline-flex"
            disabled
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </Button>
          <TopbarUserMenu />
          <AppAiSidebarToggle onMobileOpen={() => setMobileAiOpen(true)} />
        </div>
      </header>

      <AppAiSidebarMobile open={mobileAiOpen} onOpenChange={setMobileAiOpen} />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
