import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveLoginEmailOnServer } from '#/lib/server/resolve-login-email-server'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

vi.mock('#/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(),
}))

describe('resolveLoginEmailOnServer', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseAdmin).mockReset()
  })

  it('returns normalized email when identifier is an email', async () => {
    await expect(
      resolveLoginEmailOnServer('  User@Example.com '),
    ).resolves.toEqual({ email: 'user@example.com' })
    expect(getSupabaseAdmin).not.toHaveBeenCalled()
  })

  it('looks up email by username', async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { email: 'finance@example.com' },
              error: null,
            }),
          }),
        }),
      }),
    } as never)

    await expect(resolveLoginEmailOnServer('finance_user')).resolves.toEqual({
      email: 'finance@example.com',
    })
  })

  it('throws when username is not found', async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as never)

    await expect(resolveLoginEmailOnServer('missing_user')).rejects.toThrow(
      'No account found for that username',
    )
  })
})
