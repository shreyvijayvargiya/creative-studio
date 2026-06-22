import { createFileRoute } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  getAuthProviderLabel,
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials,
} from '#/lib/auth/user'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SettingsPage() {
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuth()
  const { openLoginModal } = useLoginModal()

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading account...
      </p>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to view your account details
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Sign in with username and password, or continue with Google.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openLoginModal}>Open login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = getUserDisplayName(user, profile)
  const avatarUrl = getUserAvatarUrl(user, profile)
  const providerLabel = getAuthProviderLabel(user, profile)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your account details and session
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="size-14">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary text-base text-primary-foreground">
              {getUserInitials(user, profile)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>Signed in with {providerLabel}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-medium">{profile?.username ?? '—'}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{displayName}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{profile?.email ?? user.email ?? '—'}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">
                {formatDate(profile?.createdAt ?? user.created_at)}
              </dd>
            </div>
          </dl>

          <Button
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
