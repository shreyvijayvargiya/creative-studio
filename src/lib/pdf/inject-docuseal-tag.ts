import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const DOCUSEAL_SIGNATURE_TAG =
  '{{Authorised Signature;type=signature;role=Signer;width=240;height=52}}'

/**
 * DocuSeal reads signature field position from embedded text tags.
 * pdf-lib places the tag at the declaration area (bottom of A4 page).
 */
export async function injectDocusealSignatureTag(
  pdfBuffer: Buffer,
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const page = pdfDoc.getPages()[0]
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  page.drawText(DOCUSEAL_SIGNATURE_TAG, {
    x: 40,
    y: 95,
    size: 8,
    font,
    color: rgb(1, 1, 1),
  })

  return Buffer.from(await pdfDoc.save())
}
