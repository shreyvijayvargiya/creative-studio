import { useEffect, useState } from 'react'
import { Bell, Menu, Search } from 'lucide-react'

import { SearchCommand } from '#/components/layout/search-command'
import { SidebarContent } from '#/components/layout/sidebar'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '#/components/ui/sheet'

export function Topbar() {
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
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-card px-4 shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-60 border-border bg-card p-0 text-card-foreground"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <span className="text-lg font-semibold text-foreground">
            FinanceCRM
          </span>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative flex h-9 w-full max-w-sm items-center rounded-md border border-input bg-muted/50 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="mr-2 size-4 shrink-0" />
            <span className="flex-1 truncate">Search documents...</span>
            <kbd className="pointer-events-none hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative size-9 rounded-full p-0"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    RJ
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Rajat</DropdownMenuItem>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* TODO Phase 2: add auth check here */}
              <DropdownMenuItem disabled className="text-muted-foreground">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
