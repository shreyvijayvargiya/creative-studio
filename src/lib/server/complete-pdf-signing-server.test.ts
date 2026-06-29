import type { User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchSignedPdfBuffer } from '#/lib/docuseal/client'
import { uploadPdfToUserGoogleDriveSafe } from '#/lib/google-drive/user-upload'
import { completePdfSigningOnServer } from '#/lib/server/complete-pdf-signing-server'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

vi.mock('#/lib/server/require-auth-user', () => ({
  requireAuthUser: vi.fn(),
}))

vi.mock('#/lib/docuseal/client', () => ({
  fetchSignedPdfBuffer: vi.fn(),
}))

vi.mock('#/lib/google-drive/user-upload', () => ({
  uploadPdfToUserGoogleDriveSafe: vi.fn(),
  getDefaultDriveRedirectOrigin: vi.fn(() => 'http://localhost:3000'),
}))

vi.mock('#/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(),
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'fixed-uuid'),
}))

const mockUser = { id: 'user-1' } as User
const pdfBuffer = Buffer.from('signed-pdf')

function createSupabaseAdminMock() {
  const upload = vi.fn().mockResolvedValue({ error: null })
  const single = vi.fn().mockResolvedValue({
    data: { id: 'doc-1' },
    error: null,
  })
  const insert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ single }),
  })

  return {
    storage: {
      from: vi.fn().mockReturnValue({ upload }),
    },
    from: vi.fn().mockReturnValue({ insert }),
    upload,
    insert,
    single,
  }
}

describe('completePdfSigningOnServer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuthUser).mockResolvedValue(mockUser)
    vi.mocked(fetchSignedPdfBuffer).mockResolvedValue(pdfBuffer)
  })

  it('uploads to Drive once and saves the document record', async () => {
    const supabase = createSupabaseAdminMock()
    vi.mocked(getSupabaseAdmin).mockReturnValue(supabase as never)
    vi.mocked(uploadPdfToUserGoogleDriveSafe).mockResolvedValue({
      fileId: 'drive-file-1',
      folderId: 'folder-1',
      webViewLink: 'https://drive.google.com/file/d/drive-file-1/view',
    })

    const result = await completePdfSigningOnServer(42)

    expect(fetchSignedPdfBuffer).toHaveBeenCalledWith(42)
    expect(uploadPdfToUserGoogleDriveSafe).toHaveBeenCalledTimes(1)
    expect(uploadPdfToUserGoogleDriveSafe).toHaveBeenCalledWith(
      'user-1',
      pdfBuffer,
      expect.stringMatching(/^ATO-Tax-Return-2025-/),
      'http://localhost:3000',
    )
    expect(supabase.upload).toHaveBeenCalledWith(
      'fixed-uuid.pdf',
      pdfBuffer,
      expect.objectContaining({ contentType: 'application/pdf' }),
    )
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        drive_file_id: 'drive-file-1',
        drive_url: 'https://drive.google.com/file/d/drive-file-1/view',
      }),
    )
    expect(result).toEqual({
      id: 'doc-1',
      filename: 'fixed-uuid.pdf',
      pin: expect.stringMatching(/^\d{4}$/),
      driveUrl: 'https://drive.google.com/file/d/drive-file-1/view',
    })
  })

  it('still saves to storage when Drive is not connected', async () => {
    const supabase = createSupabaseAdminMock()
    vi.mocked(getSupabaseAdmin).mockReturnValue(supabase as never)
    vi.mocked(uploadPdfToUserGoogleDriveSafe).mockResolvedValue(null)

    const result = await completePdfSigningOnServer(99)

    expect(uploadPdfToUserGoogleDriveSafe).toHaveBeenCalledTimes(1)
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.not.objectContaining({
        drive_file_id: expect.anything(),
      }),
    )
    expect(result.driveUrl).toBeNull()
  })

  it('falls back when drive columns are missing in the database', async () => {
    const supabase = createSupabaseAdminMock()
    supabase.single
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'column drive_file_id does not exist' },
      })
      .mockResolvedValueOnce({
        data: { id: 'doc-fallback' },
        error: null,
      })

    vi.mocked(getSupabaseAdmin).mockReturnValue(supabase as never)
    vi.mocked(uploadPdfToUserGoogleDriveSafe).mockResolvedValue({
      fileId: 'drive-file-1',
      folderId: 'folder-1',
      webViewLink: 'https://drive.google.com/file/d/drive-file-1/view',
    })

    const result = await completePdfSigningOnServer(7)

    expect(supabase.insert).toHaveBeenCalledTimes(2)
    expect(result.id).toBe('doc-fallback')
  })
})
