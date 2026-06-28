import { Readable } from 'node:stream'

import { google } from 'googleapis'

import {
  APP_FOLDER_NAME,
  createOAuth2ClientForRefreshToken,
  getDriveOAuthRedirectUri,
  isGoogleDriveOAuthConfigured,
} from '#/lib/google-drive/oauth'
import {
  getUserDriveConnection,
  updateUserDriveAppFolderId,
} from '#/lib/google-drive/tokens'

export interface DriveUploadResult {
  fileId: string
  webViewLink: string
  folderId: string
}

async function getOrCreateAppFolder(
  drive: ReturnType<typeof google.drive>,
): Promise<string> {
  const escapedName = APP_FOLDER_NAME.replace(/'/g, "\\'")
  const query = [
    `name='${escapedName}'`,
    "'root' in parents",
    "mimeType='application/vnd.google-apps.folder'",
    'trashed=false',
  ].join(' and ')

  const existing = await drive.files.list({
    q: query,
    fields: 'files(id)',
    pageSize: 1,
    spaces: 'drive',
  })

  const existingId = existing.data.files?.[0]?.id
  if (existingId) {
    return existingId
  }

  const created = await drive.files.create({
    requestBody: {
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root'],
    },
    fields: 'id',
  })

  const folderId = created.data.id
  if (!folderId) {
    throw new Error('Failed to create Finance CRM folder in Google Drive')
  }

  return folderId
}

export async function uploadPdfToUserGoogleDrive(
  userId: string,
  pdfBuffer: Buffer,
  filename: string,
  redirectOrigin = process.env.APP_URL ?? 'http://localhost:3000',
): Promise<DriveUploadResult | null> {
  if (!isGoogleDriveOAuthConfigured()) {
    return null
  }

  const connection = await getUserDriveConnection(userId)
  if (!connection) {
    return null
  }

  const oauth2 = createOAuth2ClientForRefreshToken(
    connection.refreshToken,
    redirectOrigin,
  )

  if (!oauth2.credentials.access_token) {
    await oauth2.getAccessToken()
  }

  const drive = google.drive({ version: 'v3', auth: oauth2 })

  let folderId = connection.appFolderId
  if (!folderId) {
    folderId = await getOrCreateAppFolder(drive)
    await updateUserDriveAppFolderId(userId, folderId)
  }

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: Readable.from(pdfBuffer),
    },
    fields: 'id, webViewLink',
  })

  const fileId = response.data.id
  if (!fileId) {
    throw new Error('Google Drive upload did not return a file ID')
  }

  return {
    fileId,
    folderId,
    webViewLink:
      response.data.webViewLink ??
      `https://drive.google.com/file/d/${fileId}/view`,
  }
}

export async function uploadPdfToUserGoogleDriveSafe(
  userId: string,
  pdfBuffer: Buffer,
  filename: string,
  redirectOrigin?: string,
): Promise<DriveUploadResult | null> {
  try {
    return await uploadPdfToUserGoogleDrive(
      userId,
      pdfBuffer,
      filename,
      redirectOrigin,
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Google Drive upload failed'

    if (
      message.includes('invalid_grant') ||
      message.includes('Token has been expired or revoked')
    ) {
      console.error(
        '[google-drive] upload failed:',
        message,
        '\n  User must reconnect Google Drive in Settings.',
      )
      return null
    }

    console.error('[google-drive] upload failed:', message)
    return null
  }
}

export function getDefaultDriveRedirectOrigin(): string {
  return (
    process.env.APP_URL?.replace(/\/$/, '') ??
    process.env.VITE_APP_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  )
}

export { getDriveOAuthRedirectUri, isGoogleDriveOAuthConfigured }
