import { useEffect, useState } from 'react'
import { Menu, PanelLeft, PanelLeftClose, Search } from 'lucide-react'

import { SearchCommand } from '#/components/layout/search-command'
import { SidebarContent } from '#/components/layout/sidebar'
import { useSidebar } from '#/components/layout/sidebar-provider'
import { Button } from '#/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '#/components/ui/sheet'

export function Topbar() {
  const { collapsed, toggleSidebar } = useSidebar()
  const [mobileOpen, setMobileOpen] = useState(false)
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
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
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
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
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
            className="relative flex h-9 w-full max-w-md items-center rounded-md border border-input bg-muted/50 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="mr-2 size-4 shrink-0" />
            <span className="flex-1 truncate">Search documents...</span>
            <kbd className="pointer-events-none hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
