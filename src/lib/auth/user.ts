import type { User } from '@supabase/supabase-js'

import type { AuthProviderKind, UserProfile } from '#/types/auth'

function mapAuthProvider(value: string | null | undefined): AuthProviderKind {
  if (value === 'google') {
    return 'google'
  }

  if (value === 'email') {
    return 'email'
  }

  return 'unknown'
}

export function mapProfileRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    username: row.username as string,
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    authProvider: mapAuthProvider(row.auth_provider as string),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function getUserDisplayName(
  user: User,
  profile?: UserProfile | null,
): string {
  if (profile?.fullName?.trim()) {
    return profile.fullName.trim()
  }

  if (profile?.username && profile.username.trim()) {
    return profile.username.trim()
  }

  const metadata = user.user_metadata as Record<string, unknown>

  if (typeof metadata.full_name === 'string' && metadata.full_name.trim()) {
    return metadata.full_name.trim()
  }

  if (typeof metadata.name === 'string' && metadata.name.trim()) {
    return metadata.name.trim()
  }

  if (typeof metadata.username === 'string' && metadata.username.trim()) {
    return metadata.username.trim()
  }

  return user.email ?? 'User'
}

export function getUserInitials(
  user: User,
  profile?: UserProfile | null,
): string {
  const name = getUserDisplayName(user, profile)
  const parts = name.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return name.slice(0, 2).toUpperCase()
}

export function getUserAvatarUrl(
  user: User,
  profile?: UserProfile | null,
): string | undefined {
  if (profile?.avatarUrl?.trim()) {
    return profile.avatarUrl.trim()
  }

  const metadata = user.user_metadata as Record<string, unknown>
  const avatarUrl = metadata.avatar_url

  return typeof avatarUrl === 'string' && avatarUrl.trim()
    ? avatarUrl.trim()
    : undefined
}

export function getAuthProviderLabel(
  user: User,
  profile?: UserProfile | null,
): string {
  if (profile?.authProvider === 'google') {
    return 'Google'
  }

  if (profile?.authProvider === 'email') {
    return 'Email & password'
  }

  const provider = user.app_metadata.provider

  if (provider === 'google') {
    return 'Google'
  }

  return 'Email & password'
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
}
