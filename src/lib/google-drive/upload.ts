import { Readable } from 'node:stream'
import { readFileSync } from 'node:fs'

import { google } from 'googleapis'
import type { JWTInput } from 'google-auth-library'

export interface DriveUploadResult {
  fileId: string
  webViewLink: string
  folderId: string
}

function normalizePrivateKey(credentials: JWTInput): JWTInput {
  if (
    credentials.private_key &&
    typeof credentials.private_key === 'string'
  ) {
    return {
      ...credentials,
      private_key: credentials.private_key.replace(/\\n/g, '\n'),
    }
  }

  return credentials
}

function parseCredentialsJson(raw: string, envVar: string): JWTInput {
  try {
    return normalizePrivateKey(JSON.parse(raw) as JWTInput)
  } catch {
    throw new Error(
      `${envVar} is not valid JSON. Use a single-line JSON string with \\n in the private_key.`,
    )
  }
}

function loadCredentialsFromEnv(): JWTInput | null {
  const inlineJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()
  if (inlineJson) {
    return parseCredentialsJson(inlineJson, 'GOOGLE_SERVICE_ACCOUNT_JSON')
  }

  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim()
  if (!keyFile) return null

  // Allow inline JSON in KEY_FILE for convenience; otherwise treat as a path.
  if (keyFile.startsWith('{')) {
    return parseCredentialsJson(keyFile, 'GOOGLE_SERVICE_ACCOUNT_KEY_FILE')
  }

  const raw = readFileSync(keyFile, 'utf8')
  return parseCredentialsJson(raw, 'GOOGLE_SERVICE_ACCOUNT_KEY_FILE')
}

function getRootFolderId(): string | null {
  return (
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ??
    process.env.GOOGLE_DRIVE_FOLDER_ID ??
    null
  )
}

export function isGoogleDriveConfigured(): boolean {
  try {
    return Boolean(loadCredentialsFromEnv() && getRootFolderId())
  } catch {
    return false
  }
}

function sanitizeFolderName(value: string): string {
  return value.replace(/[^a-zA-Z0-9@._-]/g, '_').slice(0, 120)
}

async function getOrCreateUserFolder(
  drive: ReturnType<typeof google.drive>,
  rootFolderId: string,
  folderName: string,
): Promise<string> {
  const escapedName = folderName.replace(/'/g, "\\'")
  const query = [
    `name='${escapedName}'`,
    `'${rootFolderId}' in parents`,
    "mimeType='application/vnd.google-apps.folder'",
    'trashed=false',
  ].join(' and ')

  const existing = await drive.files.list({
    q: query,
    fields: 'files(id)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  const existingId = existing.data.files?.[0]?.id
  if (existingId) {
    return existingId
  }

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    },
    fields: 'id',
    supportsAllDrives: true,
  })

  const folderId = created.data.id
  if (!folderId) {
    throw new Error('Failed to create user folder in Google Drive')
  }

  return folderId
}

function getDriveClient() {
  const credentials = loadCredentialsFromEnv()
  const rootFolderId = getRootFolderId()

  if (!credentials || !rootFolderId) {
    return null
  }

  if (
    credentials.private_key &&
    !credentials.private_key.includes('BEGIN PRIVATE KEY')
  ) {
    throw new Error(
      'Service account private_key is malformed. Ensure newlines are stored as \\n inside GOOGLE_SERVICE_ACCOUNT_JSON.',
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return {
    drive: google.drive({ version: 'v3', auth }),
    rootFolderId,
  }
}

export async function uploadPdfToGoogleDrive(
  pdfBuffer: Buffer,
  filename: string,
  userFolderLabel: string,
): Promise<DriveUploadResult | null> {
  const client = getDriveClient()
  if (!client) {
    return null
  }

  const { drive, rootFolderId } = client
  const userFolderName = sanitizeFolderName(userFolderLabel)
  const userFolderId = await getOrCreateUserFolder(
    drive,
    rootFolderId,
    userFolderName,
  )

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [userFolderId],
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: Readable.from(pdfBuffer),
    },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
  })

  const fileId = response.data.id
  if (!fileId) {
    throw new Error('Google Drive upload did not return a file ID')
  }

  return {
    fileId,
    folderId: userFolderId,
    webViewLink:
      response.data.webViewLink ??
      `https://drive.google.com/file/d/${fileId}/view`,
  }
}

export async function uploadPdfToGoogleDriveSafe(
  pdfBuffer: Buffer,
  filename: string,
  userFolderLabel: string,
): Promise<DriveUploadResult | null> {
  try {
    return await uploadPdfToGoogleDrive(pdfBuffer, filename, userFolderLabel)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Google Drive upload failed'

    const credentials = loadCredentialsFromEnv()
    const rootFolderId = getRootFolderId()
    const serviceAccount = credentials?.client_email

    if (message.includes('File not found') && rootFolderId) {
      console.error(
        '[google-drive] upload failed:',
        message,
        `\n  Folder ${rootFolderId} is not visible to the service account.`,
        serviceAccount
          ? `\n  Share that folder with ${serviceAccount} as Editor in Google Drive.`
          : '',
        '\n  Also confirm GOOGLE_DRIVE_FOLDER_ID is the folder ID from the URL (not a file ID).',
      )
      return null
    }

    console.error('[google-drive] upload failed:', message)
    return null
  }
}
