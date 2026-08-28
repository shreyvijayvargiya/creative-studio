import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_LANDING_EDIT_CHARS,
  MAX_LANDING_IMAGES,
  MAX_LANDING_PROMPT_CHARS,
  MIN_LANDING_IMAGES,
} from '#/lib/creative-studio/landing-config'
import { generateLandingPages, reviseLandingPage } from '#/lib/creative-studio/generate-landing'
import {
  decodeLandingImageBase64,
  isLandingStoragePath,
  loadLandingImages,
  storeLandingImages,
} from '#/lib/creative-studio/landing-images'
import {
  isLandingThemeId,
  listLandingThemes,
} from '#/lib/creative-studio/landing-themes'
import { getSupabaseServerClient } from '#/lib/supabase/server'
import type { GenerateLandingPagesResult, LandingThemeMeta } from '#/types/creative-studio'

const referenceImageSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, or WebP images are supported'),
})

const storedImageSchema = z.object({
  storagePath: z
    .string()
    .min(1)
    .max(500)
    .refine(isLandingStoragePath, 'Invalid landing image storage path'),
  publicPath: z.string().min(1).max(80),
  fileName: z.string().min(1).max(255),
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
  images: z.array(referenceImageSchema).min(MIN_LANDING_IMAGES).max(MAX_LANDING_IMAGES),
})

export const reviseLandingSchema = z
  .object({
    themeId: z
      .string()
      .min(1)
      .max(80)
      .refine(isLandingThemeId, 'Invalid theme'),
    userPrompt: z.string().trim().min(8).max(MAX_LANDING_PROMPT_CHARS),
    editPrompt: z.string().trim().min(2).max(MAX_LANDING_EDIT_CHARS),
    layoutId: z.string().min(1).max(80),
    previousTitle: z.string().trim().max(120).optional(),
    previousReactCode: z.string().max(200_000).optional(),
    previousHtmlCode: z.string().max(200_000).optional(),
    images: z.array(referenceImageSchema).max(MAX_LANDING_IMAGES).optional(),
    storedImages: z.array(storedImageSchema).max(MAX_LANDING_IMAGES).optional(),
    chatHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().trim().min(1).max(2000),
        }),
      )
      .max(8)
      .default([]),
  })
  .superRefine((data, ctx) => {
    const count = data.images?.length ?? data.storedImages?.length ?? 0
    if (count < MIN_LANDING_IMAGES || count > MAX_LANDING_IMAGES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Upload ${MIN_LANDING_IMAGES}–${MAX_LANDING_IMAGES} images`,
      })
    }
  })

function normalizeMime(mimeType: string): string {
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType
}

async function landingOwnerId(): Promise<string> {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? 'guest'
}

async function resolveLandingImages(input: {
  images?: z.infer<typeof referenceImageSchema>[]
  storedImages?: z.infer<typeof storedImageSchema>[]
}) {
  if (input.images && input.images.length >= MIN_LANDING_IMAGES) {
    const images = input.images.map((image) => {
      decodeLandingImageBase64(image.imageBase64)
      return {
        imageBase64: image.imageBase64,
        mimeType: normalizeMime(image.mimeType),
        fileName: image.fileName,
      }
    })
    const storedImages = await storeLandingImages({
      ownerId: await landingOwnerId(),
      images,
    })
    return { images, storedImages }
  }

  if (input.storedImages && input.storedImages.length >= MIN_LANDING_IMAGES) {
    const storedImages = input.storedImages
    const images = await loadLandingImages(storedImages)
    return { images, storedImages }
  }

  throw new Error(`Upload ${MIN_LANDING_IMAGES}–${MAX_LANDING_IMAGES} images`)
}

export async function runLandingThemeList(): Promise<LandingThemeMeta[]> {
  return listLandingThemes()
}

export async function runLandingPageGeneration(
  data: z.infer<typeof generateLandingSchema>,
): Promise<GenerateLandingPagesResult> {
  const { images, storedImages } = await resolveLandingImages({ images: data.images })

  return generateLandingPages({
    themeId: data.themeId,
    userPrompt: data.userPrompt,
    images,
    storedImages,
  })
}

export const listLandingThemesFn = createServerFn({ method: 'GET' }).handler(
  async () => runLandingThemeList(),
)

export const generateLandingPagesFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => generateLandingSchema.parse(data))
  .handler(async ({ data }) => runLandingPageGeneration(data))

export async function runLandingPageRevision(
  data: z.infer<typeof reviseLandingSchema>,
) {
  const { images, storedImages } = await resolveLandingImages({
    images: data.images,
    storedImages: data.storedImages,
  })

  return reviseLandingPage({
    themeId: data.themeId,
    userPrompt: data.userPrompt,
    editPrompt: data.editPrompt,
    layoutId: data.layoutId,
    previousTitle: data.previousTitle,
    previousReactCode: data.previousReactCode,
    previousHtmlCode: data.previousHtmlCode,
    images,
    storedImages,
    chatHistory: data.chatHistory,
  })
}

export const reviseLandingPageFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => reviseLandingSchema.parse(data))
  .handler(async ({ data }) => runLandingPageRevision(data))
