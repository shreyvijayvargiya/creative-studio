import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { google } from 'googleapis'

export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
export const GOOGLE_USERINFO_EMAIL_SCOPE =
  'https://www.googleapis.com/auth/userinfo.email'
export const GOOGLE_DRIVE_OAUTH_SCOPES = [
  GOOGLE_DRIVE_SCOPE,
  GOOGLE_USERINFO_EMAIL_SCOPE,
]
export const APP_FOLDER_NAME = 'Finance CRM'

export function getGoogleOAuthClientId(): string | null {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ??
    process.env.CLIENT_ID?.trim() ??
    null
  )
}

export function getGoogleOAuthClientSecret(): string | null {
  return (
    process.env.GOOGLE_CLIENT_SECRET?.trim() ??
    process.env.CLIENT_SECRET?.trim() ??
    null
  )
}

export function isGoogleDriveOAuthConfigured(): boolean {
  return Boolean(getGoogleOAuthClientId() && getGoogleOAuthClientSecret())
}

function formatGoogleOAuthClientIdForLogs(clientId: string): string {
  const atIndex = clientId.indexOf('.apps.googleusercontent.com')
  if (atIndex <= 0) {
    return `${clientId.slice(0, 12)}...`
  }

  return `${clientId.slice(0, 8)}...${clientId.slice(atIndex)}`
}

function getStateSecret(): string {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.CLIENT_SECRET?.trim()

  if (!secret) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or CLIENT_SECRET for OAuth state signing.',
    )
  }

  return secret
}

function getOAuthClient(redirectUri: string) {
  const clientId = getGoogleOAuthClientId()
  const clientSecret = getGoogleOAuthClientSecret()

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (or CLIENT_ID and CLIENT_SECRET).',
    )
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

type GoogleTokenErrorBody = {
  error?: string
  error_description?: string
}

function getGoogleTokenErrorMessage(
  error: unknown,
  redirectUri: string,
): string {
  const responseData = (
    error as { response?: { data?: GoogleTokenErrorBody } }
  )?.response?.data

  const googleError = responseData?.error
  const googleDescription = responseData?.error_description
  const clientId = getGoogleOAuthClientId()

  if (googleError === 'invalid_client') {
    return [
      'Google OAuth invalid_client: the client ID and client secret in .env do not match.',
      clientId
        ? `Client ID in use: ${formatGoogleOAuthClientIdForLogs(clientId)}`
        : null,
      'In Google Cloud Console → Credentials, open your Web OAuth client, copy a fresh Client ID + Client secret into .env, and restart the dev server.',
      'They must be the same Web client that has this redirect URI registered:',
      redirectUri,
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (googleError === 'redirect_uri_mismatch') {
    return `Google OAuth redirect_uri_mismatch. Register this exact URI in Google Cloud Console: ${redirectUri}`
  }

  if (googleDescription) {
    return googleDescription
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Google Drive OAuth token exchange failed'
}

export function logGoogleDriveOAuthConfig(redirectUri?: string): void {
  const clientId = getGoogleOAuthClientId()

  console.error('[google-drive][oauth-config]', {
    configured: isGoogleDriveOAuthConfigured(),
    clientId: clientId ? formatGoogleOAuthClientIdForLogs(clientId) : null,
    hasClientSecret: Boolean(getGoogleOAuthClientSecret()),
    redirectUri,
  })
}

export function getDriveOAuthRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, '')}/auth/drive-callback`
}

function signOAuthState(userId: string, redirectOrigin: string): string {
  const payload = {
    userId,
    redirectOrigin: redirectOrigin.replace(/\/$/, ''),
    nonce: randomBytes(16).toString('hex'),
    exp: Date.now() + 10 * 60 * 1000,
  }
  const payloadStr = JSON.stringify(payload)
  const signature = createHmac('sha256', getStateSecret())
    .update(payloadStr)
    .digest('base64url')

  return Buffer.from(JSON.stringify({ p: payloadStr, s: signature })).toString(
    'base64url',
  )
}

export function verifyOAuthState(state: string): {
  userId: string
  redirectOrigin: string
} {
  let parsed: { p: string; s: string }

  try {
    parsed = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    ) as typeof parsed
  } catch {
    throw new Error('Invalid Google Drive OAuth state')
  }

  const expectedSignature = createHmac('sha256', getStateSecret())
    .update(parsed.p)
    .digest('base64url')

  const actualBuffer = Buffer.from(parsed.s)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid Google Drive OAuth state signature')
  }

  const payload = JSON.parse(parsed.p) as {
    userId: string
    redirectOrigin: string
    exp: number
  }

  if (payload.exp < Date.now()) {
    throw new Error('Google Drive OAuth state expired. Please try again.')
  }

  return {
    userId: payload.userId,
    redirectOrigin: payload.redirectOrigin,
  }
}

export function createDriveConnectUrl(
  userId: string,
  redirectOrigin: string,
): string {
  const redirectUri = getDriveOAuthRedirectUri(redirectOrigin)
  const oauth2 = getOAuthClient(redirectUri)

  return oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_DRIVE_OAUTH_SCOPES,
    state: signOAuthState(userId, redirectOrigin),
  })
}

export async function exchangeDriveOAuthCode(
  code: string,
  redirectUri: string,
): Promise<{
  refreshToken: string | null
  accessToken: string | null
  googleEmail: string | null
}> {
  const oauth2 = getOAuthClient(redirectUri)

  let tokens

  try {
    const tokenResponse = await oauth2.getToken(code)
    tokens = tokenResponse.tokens
  } catch (error) {
    logGoogleDriveOAuthConfig(redirectUri)
    console.error('[google-drive][token-exchange]', error)
    throw new Error(getGoogleTokenErrorMessage(error, redirectUri))
  }

  if (!tokens.access_token && !tokens.refresh_token) {
    throw new Error('Google did not return OAuth tokens')
  }

  oauth2.setCredentials(tokens)

  // Google may return only a refresh token on re-consent; fetch an access token.
  if (!oauth2.credentials.access_token && oauth2.credentials.refresh_token) {
    try {
      const { credentials } = await oauth2.refreshAccessToken()
      oauth2.setCredentials(credentials)
    } catch (error) {
      console.warn(
        '[google-drive][token-exchange] could not refresh access token after connect',
        error,
      )
    }
  }

  let googleEmail: string | null = null

  try {
    const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 })
    const { data } = await oauth2Api.userinfo.get()
    googleEmail = data.email ?? null
  } catch (error) {
    // Email is optional; Drive connect should still succeed with refresh token.
    console.warn(
      '[google-drive][token-exchange] could not load Google account email',
      error,
    )
  }

  return {
    refreshToken: tokens.refresh_token ?? oauth2.credentials.refresh_token ?? null,
    accessToken: oauth2.credentials.access_token ?? tokens.access_token ?? null,
    googleEmail,
  }
}

export function createOAuth2ClientForRefreshToken(
  refreshToken: string,
  redirectOrigin: string,
) {
  const oauth2 = getOAuthClient(getDriveOAuthRedirectUri(redirectOrigin))
  oauth2.setCredentials({ refresh_token: refreshToken })
  return oauth2
}
