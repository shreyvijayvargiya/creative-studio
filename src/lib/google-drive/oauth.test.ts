import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createDriveConnectUrl,
  getDriveOAuthRedirectUri,
  GOOGLE_DRIVE_OAUTH_SCOPES,
  isGoogleDriveOAuthConfigured,
  verifyOAuthState,
} from '#/lib/google-drive/oauth'

describe('google drive oauth helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('builds drive callback URIs without trailing slashes', () => {
    expect(getDriveOAuthRedirectUri('http://localhost:3000')).toBe(
      'http://localhost:3000/auth/drive-callback',
    )
    expect(
      getDriveOAuthRedirectUri('https://finance-crm.buildsaas.dev/'),
    ).toBe('https://finance-crm.buildsaas.dev/auth/drive-callback')
  })

  it('detects oauth configuration from env', () => {
    expect(isGoogleDriveOAuthConfigured()).toBe(false)

    vi.stubEnv('GOOGLE_CLIENT_ID', 'id.apps.googleusercontent.com')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'secret')

    expect(isGoogleDriveOAuthConfigured()).toBe(true)
  })

  it('round-trips signed oauth state', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'id.apps.googleusercontent.com')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'secret')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-state-secret')

    const url = createDriveConnectUrl(
      'ebf26e3e-8024-4ebd-9aff-69243cdcdb32',
      'http://localhost:3000',
    )
    const state = new URL(url).searchParams.get('state')

    expect(state).toBeTruthy()
    expect(verifyOAuthState(state!)).toEqual({
      userId: 'ebf26e3e-8024-4ebd-9aff-69243cdcdb32',
      redirectOrigin: 'http://localhost:3000',
    })
  })

  it('requests drive and email scopes in connect URL', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'id.apps.googleusercontent.com')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'secret')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-state-secret')

    const url = new URL(
      createDriveConnectUrl('user-id', 'http://localhost:3000'),
    )
    const scope = url.searchParams.get('scope') ?? ''

    for (const requiredScope of GOOGLE_DRIVE_OAUTH_SCOPES) {
      expect(scope).toContain(requiredScope)
    }
  })

  it('rejects tampered oauth state', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'id.apps.googleusercontent.com')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'secret')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-state-secret')

    const url = createDriveConnectUrl('user-id', 'http://localhost:3000')
    const state = new URL(url).searchParams.get('state')!

    expect(() => verifyOAuthState(`${state}x`)).toThrow(
      'Invalid Google Drive OAuth state',
    )
  })

  it('rejects expired oauth state', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'id.apps.googleusercontent.com')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'secret')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-state-secret')

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    const url = createDriveConnectUrl('user-id', 'http://localhost:3000')
    const state = new URL(url).searchParams.get('state')!

    vi.setSystemTime(new Date('2026-01-01T00:11:00Z'))

    expect(() => verifyOAuthState(state)).toThrow(
      'Google Drive OAuth state expired. Please try again.',
    )

    vi.useRealTimers()
  })
})
