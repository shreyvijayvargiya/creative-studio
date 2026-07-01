import { describe, expect, it } from 'vitest'

import {
  isMissingDriveColumnError,
  mapDocumentRow,
} from '#/lib/server/list-documents-utils'

describe('list document helpers', () => {
  it('detects missing drive column errors', () => {
    expect(isMissingDriveColumnError('column drive_url does not exist')).toBe(
      true,
    )
    expect(isMissingDriveColumnError('column drive_file_id does not exist')).toBe(
      true,
    )
    expect(isMissingDriveColumnError('permission denied')).toBe(false)
  })

  it('maps document rows with drive URLs', () => {
    expect(
      mapDocumentRow({
        id: 'doc-1',
        name: 'ATO Tax Return',
        kind: 'pdf',
        storage_path: 'file.pdf',
        share_pin: '1234',
        created_at: '2026-01-01T00:00:00Z',
        drive_url: 'https://drive.google.com/file/d/abc/view',
      }),
    ).toEqual({
      id: 'doc-1',
      name: 'ATO Tax Return',
      kind: 'pdf',
      storagePath: 'file.pdf',
      sharePin: '1234',
      createdAt: '2026-01-01T00:00:00Z',
      pinProtected: true,
      driveUrl: 'https://drive.google.com/file/d/abc/view',
    })
  })

  it('defaults drive URL to null when absent', () => {
    expect(
      mapDocumentRow({
        id: 'doc-2',
        name: 'Budget',
        kind: 'budget',
        storage_path: 'budget.json',
        share_pin: '----',
        created_at: '2026-01-02T00:00:00Z',
      }).driveUrl,
    ).toBeNull()
  })
})
