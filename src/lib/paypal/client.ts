import {
  getPayPalApiBaseUrl,
  getPayPalClientId,
  getPayPalClientSecret,
} from '#/lib/paypal/config'

let accessToken: string | null = null
let accessTokenExpiresAt = 0

async function fetchAccessToken(): Promise<string> {
  if (accessToken && Date.now() < accessTokenExpiresAt - 60_000) {
    return accessToken
  }

  const credentials = Buffer.from(
    `${getPayPalClientId()}:${getPayPalClientSecret()}`,
  ).toString('base64')

  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`PayPal auth failed: ${body}`)
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  accessToken = data.access_token
  accessTokenExpiresAt = Date.now() + data.expires_in * 1000
  return accessToken
}

export async function paypalRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await fetchAccessToken()
  const response = await fetch(`${getPayPalApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
      ...init?.headers,
    },
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as T) : ({} as T)

  if (!response.ok) {
    throw new Error(
      `PayPal API ${path} failed (${response.status}): ${text || response.statusText}`,
    )
  }

  return data
}
