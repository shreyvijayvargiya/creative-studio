import { Autosend } from 'autosendjs'

import { EMAIL_FROM, getAutosendApiKey } from '#/lib/email/config'

/**
 * Autosend REST SDK (AUTOSEND_API_KEY).
 * Use for bulk/campaign sends. Transactional welcome/subscription emails use SMTP.
 */
export function getAutosendClient(): Autosend | null {
  const apiKey = getAutosendApiKey()
  if (!apiKey) return null
  return new Autosend(apiKey)
}

export async function sendViaAutosendApi(input: {
  to: string | string[]
  subject: string
  html: string
  fromEmail?: string
  fromName?: string
}): Promise<unknown> {
  const autosend = getAutosendClient()
  if (!autosend) {
    throw new Error('AUTOSEND_API_KEY is not configured')
  }

  const recipients = (Array.isArray(input.to) ? input.to : [input.to]).map(
    (email) => ({ email }),
  )

  if (recipients.length === 0) {
    throw new Error('At least one recipient is required')
  }

  const from = {
    email: input.fromEmail ?? EMAIL_FROM.email,
    name: input.fromName ?? EMAIL_FROM.name,
  }

  if (recipients.length === 1) {
    return autosend.emails.send({
      from,
      to: recipients[0],
      subject: input.subject,
      html: input.html,
    })
  }

  return autosend.emails.bulk({
    from,
    subject: input.subject,
    html: input.html,
    recipients,
  })
}
