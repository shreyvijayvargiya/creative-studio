import { extractText } from 'unpdf'

const MAX_TEXT_CHARS = 60_000

export async function extractTextFromPdfBuffer(
  pdfBuffer: Buffer | Uint8Array,
): Promise<string> {
  const { text } = await extractText(pdfBuffer, { mergePages: true })
  const normalized = (Array.isArray(text) ? text.join('\n') : String(text ?? ''))
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!normalized) {
    throw new Error(
      'Could not read text from this PDF. It may be a scanned image — try a text-based bank statement.',
    )
  }

  if (normalized.length <= MAX_TEXT_CHARS) {
    return normalized
  }

  return `${normalized.slice(0, MAX_TEXT_CHARS)}\n\n[Truncated for AI extraction]`
}
