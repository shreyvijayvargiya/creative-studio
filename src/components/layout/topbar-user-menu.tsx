import { Link, useRouterState } from '@tanstack/react-router'
import { LogIn, LogOut, Moon, Settings, Sun } from 'lucide-react'
// DEMO: Sparkles unused while Upgrade is commented
// import { LogIn, LogOut, Moon, Settings, Sparkles, Sun } from 'lucide-react'

import { useAuth } from '#/components/auth/auth-provider'
// DEMO: login modal unused on Creative Studio (Google OAuth direct)
// import { useLoginModal } from '#/components/auth/login-modal-provider'
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

export function TopbarUserMenu() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isCreativeStudio =
    pathname === '/creative-studio' || pathname.startsWith('/creative-studio/')
  const { user, profile, isAuthenticated, signOut, signInWithGoogle } = useAuth()
  // DEMO: subscribe modal unused while Upgrade is commented
  // const { openSubscribeModal } = useSubscribeModal()
  // const { openLoginModal } = useLoginModal()
  const { theme, toggleTheme } = useTheme()

  if (!isAuthenticated || !user) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => {
          // DEMO: Creative Studio uses Google OAuth — no modal
          if (isCreativeStudio) {
            void signInWithGoogle()
            return
          }
          // Non-demo routes still used login modal historically; keep Google for simplicity
          void signInWithGoogle()
        }}
      >
        <LogIn className="size-4" />
        Sign in
      </Button>
    )
  }

  const displayName = getUserDisplayName(user, profile)
  const avatarUrl = getUserAvatarUrl(user, profile)
  const email = profile?.email ?? user.email ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full"
        >
          <Avatar className="size-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {getUserInitials(user, profile)}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* DEMO: hide Upgrade plan on Creative Studio demos — restore later
        <DropdownMenuItem onClick={openSubscribeModal}>
          <Sparkles className="size-4" />
          Upgrade plan
        </DropdownMenuItem>
        */}
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
  )
}
