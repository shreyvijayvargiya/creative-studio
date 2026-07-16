import nodemailer from 'nodemailer'

import {
  AUTOSEND_SMTP,
  EMAIL_FROM,
  getAutosendSmtpKey,
  isAutosendSmtpConfigured,
} from '#/lib/email/config'

export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  text?: string
  fromEmail?: string
  fromName?: string
}

export interface SendEmailResult {
  messageId: string
  accepted: string[]
}

function createTransporter() {
  const pass = getAutosendSmtpKey()
  if (!pass) {
    throw new Error('AUTOSEND_SMTP_KEY is not configured')
  }

  return nodemailer.createTransport({
    host: AUTOSEND_SMTP.host,
    port: AUTOSEND_SMTP.port,
    secure: false,
    auth: {
      user: AUTOSEND_SMTP.user,
      pass,
    },
  })
}

export async function sendViaAutosendSmtp(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  if (!isAutosendSmtpConfigured()) {
    throw new Error('AUTOSEND_SMTP_KEY is not configured')
  }

  const to = Array.isArray(input.to) ? input.to : [input.to]
  if (to.length === 0) {
    throw new Error('At least one recipient is required')
  }

  const fromEmail = input.fromEmail ?? EMAIL_FROM.email
  const fromName = input.fromName ?? EMAIL_FROM.name
  const transporter = createTransporter()

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: to.join(', '),
    subject: input.subject,
    html: input.html,
    text: input.text,
  })

  return {
    messageId: info.messageId,
    accepted: (info.accepted ?? []).map(String),
  }
}
