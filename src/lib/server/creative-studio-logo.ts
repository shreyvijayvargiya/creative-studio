import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { MAX_PROMPT_CHARS, MAX_REFERENCE_IMAGES } from '#/lib/creative-studio/config'
import { generateCreativeLogos } from '#/lib/creative-studio/generate-logos'
import type { GenerateCreativeLogosResult } from '#/types/creative-studio'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_BRAND_CHARS = 80

const referenceImageSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(
      /^image\/(jpeg|jpg|png|webp|svg\+xml)$/i,
      'Only JPEG, PNG, WebP, or SVG images are supported',
    ),
})

export const generateLogosSchema = z
  .object({
    brandName: z.string().trim().max(MAX_BRAND_CHARS).optional(),
    userPrompt: z.string().trim().max(MAX_PROMPT_CHARS).optional(),
    images: z.array(referenceImageSchema).max(MAX_REFERENCE_IMAGES).default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.brandName && !data.userPrompt && data.images.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Add a brand name, a prompt, or a reference image',
        path: ['userPrompt'],
      })
    }
  })

function decodeImageBase64(imageBase64: string): Buffer {
  const cleaned = imageBase64.replace(/^data:[^;]+;base64,/i, '')
  const buffer = Buffer.from(cleaned, 'base64')
  if (buffer.byteLength === 0) {
    throw new Error('Image file is empty')
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large (max 8MB)')
  }
  return buffer
}

function normalizeMime(mimeType: string): string {
  const lower = mimeType.toLowerCase()
  if (lower === 'image/jpg') return 'image/jpeg'
  return lower
}

export async function runCreativeLogoGeneration(
  data: z.infer<typeof generateLogosSchema>,
): Promise<GenerateCreativeLogosResult> {
  data.images.forEach((image) => decodeImageBase64(image.imageBase64))

  return generateCreativeLogos({
    brandName: data.brandName,
    userPrompt: data.userPrompt ?? '',
    images: data.images.map((image) => ({
      imageBase64: image.imageBase64,
      mimeType: normalizeMime(image.mimeType),
      fileName: image.fileName,
    })),
  })
}

export const generateCreativeLogosFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => generateLogosSchema.parse(data))
  .handler(async ({ data }) => {
    return runCreativeLogoGeneration(data)
  })
