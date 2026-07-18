import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Menu, PanelLeft, PanelLeftClose, Search, Sparkles } from 'lucide-react'

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

interface TopbarProps {
  /** DEMO: Creative Studio — hide Finance CRM chrome, keep avatar */
  demoMode?: boolean
}

export function Topbar({ demoMode = false }: TopbarProps) {
  const { collapsed, toggleSidebar } = useSidebar()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileAiOpen, setMobileAiOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (demoMode) return

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [demoMode])

  return (
    <>
      <header className="z-30 flex h-14 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 sm:gap-3 sm:px-4">
        {/* DEMO: Finance CRM mobile nav + sidebar toggle hidden on Creative Studio */}
        {!demoMode ? (
          <>
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
          </>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-semibold tracking-tight text-foreground hover:bg-muted"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="size-3.5" />
            </span>
            <span className="hidden sm:inline">Creative Studio</span>
          </Link>
        )}

        {/* DEMO: document search hidden on Creative Studio */}
        {!demoMode ? (
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
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggleButton className="hidden sm:inline-flex" />
          {/* DEMO: notifications + AI toggle hidden; avatar kept */}
          {!demoMode ? (
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
          ) : null}
          <TopbarUserMenu />
          {!demoMode ? (
            <AppAiSidebarToggle onMobileOpen={() => setMobileAiOpen(true)} />
          ) : null}
        </div>
      </header>

      {!demoMode ? (
        <>
          <AppAiSidebarMobile open={mobileAiOpen} onOpenChange={setMobileAiOpen} />
          <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
        </>
      ) : null}
    </>
  )
}
