import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_ASSET_COUNT,
  MIN_ASSET_COUNT,
  getFormat,
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

const generateSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, or WebP images are supported'),
  ...platformFormatFields,
  count: z.number().int().min(MIN_ASSET_COUNT).max(MAX_ASSET_COUNT),
  productNotes: z.string().max(500).optional(),
})

const regenerateSchema = z.object({
  fileName: z.string().min(1).max(255),
  imageBase64: z.string().min(1),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, 'Only JPEG, PNG, or WebP images are supported'),
  ...platformFormatFields,
  count: z.number().int().min(MIN_ASSET_COUNT).max(MAX_ASSET_COUNT),
  variantIndex: z.number().int().min(0).max(MAX_ASSET_COUNT - 1),
  productNotes: z.string().max(500).optional(),
  editPrompt: z.string().trim().min(1).max(500),
  previousVariantUrl: z.string().max(12_000_000).optional(),
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

  decodeImageBase64(data.imageBase64)

  const { variants, model } = await generateCreativeAssets({
    imageBase64: data.imageBase64,
    mimeType: normalizeMime(data.mimeType),
    platformId: data.platformId,
    formatId: data.formatId,
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

  decodeImageBase64(data.imageBase64)

  return regenerateCreativeAsset({
    imageBase64: data.imageBase64,
    mimeType: normalizeMime(data.mimeType),
    platformId: data.platformId,
    formatId: data.formatId,
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
