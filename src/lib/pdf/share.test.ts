import { describe, expect, it } from 'vitest'

import {
  buildPdfSharePath,
  buildPdfShareUrl,
  formatPin,
  getSignedUrlExpiryDate,
  parseShareFilename,
  PDF_SIGNED_URL_TTL_SECONDS,
} from '#/lib/pdf/share'

describe('pdf share helpers', () => {
  it('builds encoded share paths', () => {
    expect(buildPdfSharePath('my report.pdf')).toBe(
      '/pdf/view/my%20report.pdf',
    )
  })

  it('builds full share URLs with origin', () => {
    expect(buildPdfShareUrl('doc.pdf', 'https://finance-crm.buildsaas.dev')).toBe(
      'https://finance-crm.buildsaas.dev/pdf/view/doc.pdf',
    )
  })

  it('parses filenames from raw values, paths, and URLs', () => {
    expect(parseShareFilename('report.pdf')).toBe('report.pdf')
    expect(parseShareFilename('/pdf/view/report%20.pdf')).toBe('report .pdf')
    expect(
      parseShareFilename('https://app.example/pdf/view/a.pdf'),
    ).toBe('a.pdf')
    expect(parseShareFilename('')).toBeNull()
    expect(parseShareFilename('https://example.com/other')).toBeNull()
  })

  it('formats PINs to four digits', () => {
    expect(formatPin('42')).toBe('0042')
    expect(formatPin('12345')).toBe('1234')
  })

  it('computes signed URL expiry from TTL', () => {
    const before = Date.now()
    const expiry = getSignedUrlExpiryDate(PDF_SIGNED_URL_TTL_SECONDS)
    const after = Date.now()

    expect(expiry.getTime()).toBeGreaterThanOrEqual(
      before + PDF_SIGNED_URL_TTL_SECONDS * 1000,
    )
    expect(expiry.getTime()).toBeLessThanOrEqual(
      after + PDF_SIGNED_URL_TTL_SECONDS * 1000,
    )
  })
})
