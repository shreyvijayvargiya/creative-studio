/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from 'vitest'

import {
  AUTH_COOKIE_KEY,
  clearAuthCookie,
  readAuthCookie,
  setAuthCookie,
  userFromAuthCookie,
} from '#/lib/auth/auth-cookie'

afterEach(() => {
  clearAuthCookie()
})

describe('auth cookie', () => {
  it('stores and reads a valid auth cookie', () => {
    setAuthCookie({ id: 'user-1', email: 'user@example.com' })

    const cached = readAuthCookie()

    expect(cached).toMatchObject({
      userId: 'user-1',
      email: 'user@example.com',
    })
    expect(cached?.exp).toBeGreaterThan(Date.now())
  })

  it('clears expired cookies', () => {
    const expired = encodeURIComponent(
      JSON.stringify({
        userId: 'user-1',
        email: 'user@example.com',
        exp: Date.now() - 1_000,
      }),
    )

    document.cookie = `${AUTH_COOKIE_KEY}=${expired}; path=/`

    expect(readAuthCookie()).toBeNull()
    expect(document.cookie.includes(AUTH_COOKIE_KEY)).toBe(false)
  })

  it('builds a minimal user from cookie payload', () => {
    const user = userFromAuthCookie({
      userId: 'user-1',
      email: 'user@example.com',
      exp: Date.now() + 60_000,
    })

    expect(user.id).toBe('user-1')
    expect(user.email).toBe('user@example.com')
  })
})
