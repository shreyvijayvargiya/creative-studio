import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_ASSET_COUNT,
  MAX_DIMENSION_PX,
  MAX_PROMPT_CHARS,
  MAX_REFERENCE_IMAGES,
  MIN_ASSET_COUNT,
  MIN_DIMENSION_PX,
  MIN_REFERENCE_IMAGES,
  getFormat,
  resolveCreativeDimension,
} from '#/lib/creative-studio/config'
import {
  generateCreativeAssets,
  regenerateCreativeAsset,
} from '#/lib/creative-studio/generate-assets'
// DEMO: asset generation is public — no requireAuthUser
// import { requireAuthUser } from '#/lib/server/require-auth-user'
import type {
  CreativeVariant,
  GenerateCreativesResult,
} from '#/types/creative-studio'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const platformFormatFields = {
  platformId: z.enum(['etsy', 'shopify', 'instagram', 'pinterest']),
  formatId: z.enum([
    'etsy-listing',
    'etsy-thumbnail',
    'shopify-hero',
    'shopify-collection',
    'instagram-feed',
    'instagram-story',
    'pinterest-pin',
  ]),
  dimensionId: z.enum([
    'thumbnail',
    'logo',
    'poster',
    'magazine',
    'banner',
    'reel',
    'short',
    'custom',
  ]),
  widthPx: z.number().int().min(MIN_DIMENSION_PX).max(MAX_DIMENSION_PX).optional(),
  heightPx: z.number().int().min(MIN_DIMENSION_PX).max(MAX_DIMENSION_PX).optional(),
  styleId: z.enum(['studio', 'cozy', 'festive', 'outdoor', 'flatlay']),
  paletteId: z.enum([
    'studio-neutral',
    'warm-linen',
    'forest-earth',
    'ocean-breeze',
    'blush-rose',
    'midnight-ink',
    'citrus-pop',
    'terracotta-clay',
    'lavender-mist',
    'monochrome',
  ]),
} as const

const referenceImageSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, or WebP images are supported'),
})

const generateSchema = z
  .object({
    images: z.array(referenceImageSchema).min(MIN_REFERENCE_IMAGES).max(MAX_REFERENCE_IMAGES),
    ...platformFormatFields,
    count: z.number().int().min(MIN_ASSET_COUNT).max(MAX_ASSET_COUNT),
    productNotes: z.string().max(MAX_PROMPT_CHARS).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dimensionId === 'custom' && (data.widthPx == null || data.heightPx == null)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Custom dimension requires width and height',
        path: ['widthPx'],
      })
    }
  })

const regenerateSchema = z
  .object({
    images: z.array(referenceImageSchema).min(MIN_REFERENCE_IMAGES).max(MAX_REFERENCE_IMAGES),
    ...platformFormatFields,
    count: z.number().int().min(MIN_ASSET_COUNT).max(MAX_ASSET_COUNT),
    variantIndex: z.number().int().min(0).max(MAX_ASSET_COUNT - 1),
    productNotes: z.string().max(MAX_PROMPT_CHARS).optional(),
    editPrompt: z.string().trim().min(1).max(MAX_PROMPT_CHARS),
    previousVariantUrl: z.string().max(12_000_000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dimensionId === 'custom' && (data.widthPx == null || data.heightPx == null)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Custom dimension requires width and height',
        path: ['widthPx'],
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
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType
}

export async function runCreativeGeneration(
  data: z.infer<typeof generateSchema>,
): Promise<GenerateCreativesResult> {
  const format = getFormat(data.formatId)
  if (format.platformId !== data.platformId) {
    throw new Error('Selected format does not belong to the chosen platform')
  }

  const dimension = resolveCreativeDimension(data.dimensionId, data.widthPx, data.heightPx)

  data.images.forEach((image) => decodeImageBase64(image.imageBase64))

  const { variants, model } = await generateCreativeAssets({
    images: data.images.map((image) => ({
      imageBase64: image.imageBase64,
      mimeType: normalizeMime(image.mimeType),
      fileName: image.fileName,
    })),
    platformId: data.platformId,
    formatId: data.formatId,
    dimensionId: dimension.id,
    widthPx: dimension.widthPx,
    heightPx: dimension.heightPx,
    styleId: data.styleId,
    paletteId: data.paletteId,
    count: data.count,
    productNotes: data.productNotes,
  })

  return {
    variants,
    model,
    platformId: data.platformId,
    styleId: data.styleId,
    formatId: data.formatId,
    dimensionId: dimension.id,
    widthPx: dimension.widthPx,
    heightPx: dimension.heightPx,
    count: variants.length,
  }
}

export async function runCreativeRegeneration(
  data: z.infer<typeof regenerateSchema>,
): Promise<{ variant: CreativeVariant; model: string }> {
  const format = getFormat(data.formatId)
  if (format.platformId !== data.platformId) {
    throw new Error('Selected format does not belong to the chosen platform')
  }

  if (data.variantIndex >= data.count) {
    throw new Error('variantIndex must be less than count')
  }

  data.images.forEach((image) => decodeImageBase64(image.imageBase64))

  const dimension = resolveCreativeDimension(data.dimensionId, data.widthPx, data.heightPx)

  return regenerateCreativeAsset({
    images: data.images.map((image) => ({
      imageBase64: image.imageBase64,
      mimeType: normalizeMime(image.mimeType),
      fileName: image.fileName,
    })),
    platformId: data.platformId,
    formatId: data.formatId,
    dimensionId: dimension.id,
    widthPx: dimension.widthPx,
    heightPx: dimension.heightPx,
    styleId: data.styleId,
    paletteId: data.paletteId,
    count: data.count,
    variantIndex: data.variantIndex,
    productNotes: data.productNotes,
    editPrompt: data.editPrompt,
    previousVariantUrl: data.previousVariantUrl,
  })
}

export const generateCreatives = createServerFn({ method: 'POST' })
  .validator((data: unknown) => generateSchema.parse(data))
  .handler(async ({ data }) => {
    // DEMO: open generation — auth restored later with:
    // await requireAuthUser()
    return runCreativeGeneration(data)
  })

export const regenerateCreative = createServerFn({ method: 'POST' })
  .validator((data: unknown) => regenerateSchema.parse(data))
  .handler(async ({ data }) => {
    // DEMO: open regenerate — auth restored later with:
    // await requireAuthUser()
    return runCreativeRegeneration(data)
  })

export { generateSchema, regenerateSchema }
