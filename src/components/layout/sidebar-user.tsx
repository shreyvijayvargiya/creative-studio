import { Link } from '@tanstack/react-router'
import { ChevronsUpDown, LogIn, LogOut, Moon, Settings, Sun } from 'lucide-react'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { useTheme } from '#/components/layout/theme-provider'
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials,
} from '#/lib/auth/user'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export function SidebarUserFooter() {
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const { openLoginModal } = useLoginModal()
  const { theme, toggleTheme } = useTheme()

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={openLoginModal}
        >
          <LogIn className="size-4" />
          Sign in
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    )
  }

  const displayName = getUserDisplayName(user, profile)
  const avatarUrl = getUserAvatarUrl(user, profile)
  const email = profile?.email ?? user.email ?? ''

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto min-w-0 flex-1 justify-start gap-2 px-2 py-2"
          >
            <Avatar className="size-8 shrink-0">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {getUserInitials(user, profile)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium">
                {displayName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {email}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
