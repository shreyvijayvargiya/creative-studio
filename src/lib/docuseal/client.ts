import docuseal from '@docuseal/api'

function getDocusealApiKey(): string {
  const key = process.env.DOCUSEAL_API_KEY
  if (!key) {
    throw new Error('DOCUSEAL_API_KEY is not configured')
  }
  return key
}

export function getDocusealClient() {
  docuseal.configure({
    key: getDocusealApiKey(),
    url: process.env.DOCUSEAL_API_URL ?? 'https://api.docuseal.com',
  })
  return docuseal
}

export interface DocusealSubmissionResult {
  submissionId: number
  embedSrc: string
  submitterEmail: string
}

export async function createPdfSigningSubmission(
  pdfBuffer: Buffer,
  submitterEmail: string,
  submitterName: string,
): Promise<DocusealSubmissionResult> {
  const client = getDocusealClient()
  const base64 = pdfBuffer.toString('base64')

  const submission = await client.createSubmissionFromPdf({
    name: 'ATO Tax Return 2025',
    send_email: false,
    documents: [
      {
        name: 'ato-tax-return-2025.pdf',
        file: base64,
      },
    ],
    submitters: [
      {
        role: 'Signer',
        email: submitterEmail,
        name: submitterName,
      },
    ],
  })

  const submitter = submission.submitters?.[0]
  const embedSrc =
    (submitter as { embed_src?: string } | undefined)?.embed_src ??
    (submitter?.slug ? `https://docuseal.com/s/${submitter.slug}` : null)

  if (!embedSrc) {
    throw new Error('DocuSeal did not return a signing URL')
  }

  return {
    submissionId: submission.id,
    embedSrc,
    submitterEmail,
  }
}

export async function getSubmissionSigningUrl(
  submissionId: number,
): Promise<string> {
  const apiKey = getDocusealApiKey()
  const baseUrl = process.env.DOCUSEAL_API_URL ?? 'https://api.docuseal.com'

  const response = await fetch(`${baseUrl}/submissions/${submissionId}`, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load signing session: ${response.statusText}`)
  }

  const data = (await response.json()) as {
    submitters?: Array<{ embed_src?: string; slug?: string }>
  }

  const submitter = data.submitters?.[0]
  const embedSrc =
    submitter?.embed_src ??
    (submitter?.slug ? `https://docuseal.com/s/${submitter.slug}` : null)

  if (!embedSrc) {
    throw new Error('Signing URL is not available for this submission')
  }

  return embedSrc
}

export async function fetchSignedPdfBuffer(
  submissionId: number,
): Promise<Buffer> {
  const apiKey = getDocusealApiKey()
  const baseUrl = process.env.DOCUSEAL_API_URL ?? 'https://api.docuseal.com'

  const response = await fetch(
    `${baseUrl}/submissions/${submissionId}/documents?merge=true`,
    {
      headers: {
        'X-Auth-Token': apiKey,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch signed PDF: ${response.statusText}`)
  }

  const data = (await response.json()) as {
    documents?: Array<{ url?: string }>
  }

  const documentUrl = data.documents?.[0]?.url
  if (!documentUrl) {
    throw new Error('Signed PDF is not available yet')
  }

  const pdfResponse = await fetch(documentUrl)
  if (!pdfResponse.ok) {
    throw new Error('Failed to download signed PDF')
  }

  const arrayBuffer = await pdfResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
