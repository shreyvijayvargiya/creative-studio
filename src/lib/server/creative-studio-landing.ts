import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_LANDING_IMAGES,
  MAX_LANDING_PROMPT_CHARS,
  MAX_LANDING_VARIANTS,
  MIN_LANDING_VARIANTS,
} from '#/lib/creative-studio/landing-config'
import { generateLandingPages } from '#/lib/creative-studio/generate-landing'
import {
  isLandingThemeId,
  listLandingThemes,
} from '#/lib/creative-studio/landing-themes'
import type { GenerateLandingPagesResult, LandingThemeMeta } from '#/types/creative-studio'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const referenceImageSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, or WebP images are supported'),
})

export const generateLandingSchema = z.object({
  themeId: z
    .string()
    .min(1)
    .max(80)
    .refine(isLandingThemeId, 'Invalid theme'),
  userPrompt: z.string().trim().min(8).max(MAX_LANDING_PROMPT_CHARS),
  count: z.number().int().min(MIN_LANDING_VARIANTS).max(MAX_LANDING_VARIANTS),
  images: z.array(referenceImageSchema).max(MAX_LANDING_IMAGES).default([]),
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

export async function runLandingThemeList(): Promise<LandingThemeMeta[]> {
  return listLandingThemes()
}

export async function runLandingPageGeneration(
  data: z.infer<typeof generateLandingSchema>,
): Promise<GenerateLandingPagesResult> {
  data.images.forEach((image) => decodeImageBase64(image.imageBase64))

  return generateLandingPages({
    themeId: data.themeId,
    userPrompt: data.userPrompt,
    count: data.count,
    images: data.images.map((image) => ({
      imageBase64: image.imageBase64,
      mimeType: normalizeMime(image.mimeType),
      fileName: image.fileName,
    })),
  })
}

export const listLandingThemesFn = createServerFn({ method: 'GET' }).handler(
  async () => runLandingThemeList(),
)

export const generateLandingPagesFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => generateLandingSchema.parse(data))
  .handler(async ({ data }) => runLandingPageGeneration(data))
