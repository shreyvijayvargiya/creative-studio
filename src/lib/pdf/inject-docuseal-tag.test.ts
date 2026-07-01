import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { injectDocusealSignatureTag } from '#/lib/pdf/inject-docuseal-tag'

describe('injectDocusealSignatureTag', () => {
  it('returns a valid PDF with the same page count', async () => {
    const source = await PDFDocument.create()
    source.addPage()
    const input = Buffer.from(await source.save())

    const output = await injectDocusealSignatureTag(input)
    const parsed = await PDFDocument.load(output)

    expect(Buffer.isBuffer(output)).toBe(true)
    expect(output.length).toBeGreaterThan(input.length)
    expect(parsed.getPageCount()).toBe(1)
  })
})
