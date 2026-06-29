import type { DocumentKind, DocumentListItem } from '#/types'

export function isMissingDriveColumnError(message: string): boolean {
  return message.includes('drive_file_id') || message.includes('drive_url')
}

export function mapDocumentRow(row: {
  id: unknown
  name: unknown
  kind: unknown
  storage_path: unknown
  share_pin: unknown
  created_at: unknown
  drive_url?: unknown
}): DocumentListItem {
  const kind = row.kind as DocumentKind

  return {
    id: row.id as string,
    name: row.name as string,
    kind,
    storagePath: row.storage_path as string,
    sharePin: row.share_pin as string,
    createdAt: row.created_at as string,
    pinProtected: kind === 'pdf' && (row.share_pin as string) !== '----',
    driveUrl: (row.drive_url as string | null) ?? null,
  }
}
