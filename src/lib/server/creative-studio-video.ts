import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_PROMPT_CHARS,
  MAX_REFERENCE_IMAGES,
  MIN_REFERENCE_IMAGES,
} from '#/lib/creative-studio/config'
import { generateCreativeVideo } from '#/lib/creative-studio/generate-video'
import { VIDEO_FORMAT_IDS, getVideoFormat } from '#/lib/creative-studio/video-formats'
import type { GenerateCreativeVideoResult } from '#/types/creative-studio'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const referenceImageSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, or WebP images are supported'),
})

export const generateVideoSchema = z.object({
  images: z.array(referenceImageSchema).min(MIN_REFERENCE_IMAGES).max(MAX_REFERENCE_IMAGES),
  formatId: z.enum(VIDEO_FORMAT_IDS),
  userPrompt: z.string().trim().min(1).max(MAX_PROMPT_CHARS),
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
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType
}

export async function runCreativeVideoGeneration(
  data: z.infer<typeof generateVideoSchema>,
): Promise<GenerateCreativeVideoResult> {
  getVideoFormat(data.formatId)
  data.images.forEach((image) => decodeImageBase64(image.imageBase64))

  return generateCreativeVideo({
    images: data.images.map((image) => ({
      imageBase64: image.imageBase64,
      mimeType: normalizeMime(image.mimeType),
      fileName: image.fileName,
    })),
    formatId: data.formatId,
    userPrompt: data.userPrompt,
  })
}

export const generateCreativeVideoFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => generateVideoSchema.parse(data))
  .handler(async ({ data }) => {
    return runCreativeVideoGeneration(data)
  })
