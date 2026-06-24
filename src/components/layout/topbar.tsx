import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  LogIn,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Search,
  Settings,
} from 'lucide-react'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { SearchCommand } from '#/components/layout/search-command'
import { SidebarContent } from '#/components/layout/sidebar'
import { useSidebar } from '#/components/layout/sidebar-provider'
import {
  getUserAvatarUrl,
  getUserInitials,
} from '#/lib/auth/user'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
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
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const { openLoginModal } = useLoginModal()
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

  const avatarUrl = user ? getUserAvatarUrl(user, profile) : undefined
  const avatarInitials = user ? getUserInitials(user, profile) : 'U'

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative size-9 rounded-full p-0"
              >
                <Avatar className="size-8">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Account avatar" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => void signOut()}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={openLoginModal}
                >
                  <LogIn className="size-4" />
                  Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
