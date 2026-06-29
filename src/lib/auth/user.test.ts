import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import {
  getAuthProviderLabel,
  getUserDisplayName,
  getUserInitials,
  mapProfileRow,
  normalizeUsername,
} from '#/lib/auth/user'
import type { UserProfile } from '#/types/auth'

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as User
}

describe('auth user helpers', () => {
  it('normalizes usernames', () => {
    expect(normalizeUsername('  Foo-Bar!  ')).toBe('foo_bar_')
    expect(normalizeUsername('valid_user')).toBe('valid_user')
  })

  it('prefers profile full name for display', () => {
    const user = mockUser({ email: 'user@example.com' })
    const profile: UserProfile = {
      id: 'user-1',
      username: 'finance_user',
      email: 'user@example.com',
      fullName: 'Jane Taxpayer',
      avatarUrl: null,
      authProvider: 'email',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }

    expect(getUserDisplayName(user, profile)).toBe('Jane Taxpayer')
    expect(getUserInitials(user, profile)).toBe('JT')
  })

  it('maps profile rows from the database shape', () => {
    expect(
      mapProfileRow({
        id: 'user-1',
        username: 'finance_user',
        email: 'user@example.com',
        full_name: 'Jane Taxpayer',
        avatar_url: null,
        auth_provider: 'google',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      }),
    ).toEqual({
      id: 'user-1',
      username: 'finance_user',
      email: 'user@example.com',
      fullName: 'Jane Taxpayer',
      avatarUrl: null,
      authProvider: 'google',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    })
  })

  it('labels auth providers', () => {
    const googleProfile: UserProfile = {
      id: 'user-1',
      username: 'google_user',
      email: 'g@example.com',
      fullName: null,
      avatarUrl: null,
      authProvider: 'google',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }

    expect(getAuthProviderLabel(mockUser(), googleProfile)).toBe('Google')
    expect(
      getAuthProviderLabel(
        mockUser({ app_metadata: { provider: 'google' } }),
        null,
      ),
    ).toBe('Google')
    expect(getAuthProviderLabel(mockUser(), null)).toBe('Email & password')
  })
})
