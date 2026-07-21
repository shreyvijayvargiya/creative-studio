import { buildCreativeImagePrompt } from '#/lib/creative-studio/build-prompt'
import { getFormat } from '#/lib/creative-studio/config'
import type {
  CreativeFormatId,
  CreativePaletteId,
  CreativePlatformId,
  CreativeStyleId,
  CreativeVariant,
} from '#/types/creative-studio'

const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images'

interface OpenRouterImageItem {
  b64_json?: string
  media_type?: string
  url?: string
}

interface OpenRouterImagesResponse {
  data?: OpenRouterImageItem[]
  error?: { message?: string }
}

function getImageModelConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add it to .env and restart `npm run dev`.',
    )
  }

  return {
    apiKey,
    model:
      process.env.OPENROUTER_IMAGE_MODEL?.trim() ||
      'google/gemini-2.5-flash-image',
    siteUrl: process.env.APP_URL?.trim() ?? 'http://localhost:3000',
    siteName: 'Creative Studio',
  }
}

function toDataUrl(imageBase64: string, mimeType: string): string {
  const cleaned = imageBase64.replace(/^data:[^;]+;base64,/i, '')
  return `data:${mimeType};base64,${cleaned}`
}

async function generateOneVariant(input: {
  config: ReturnType<typeof getImageModelConfig>
  referenceUrl: string
  aspectRatio: string
  platformId: CreativePlatformId
  formatId: CreativeFormatId
  styleId: CreativeStyleId
  paletteId: CreativePaletteId
  count: number
  variantIndex: number
  productNotes?: string
  editPrompt?: string
  /** Prefer the current generated image as the edit reference when regenerating. */
  previousVariantUrl?: string
}): Promise<CreativeVariant> {
  const prompt = buildCreativeImagePrompt({
    platformId: input.platformId,
    formatId: input.formatId,
    styleId: input.styleId,
    paletteId: input.paletteId,
    count: input.count,
    variantIndex: input.variantIndex,
    productNotes: input.productNotes,
    editPrompt: input.editPrompt,
  })

  const references = [
    {
      type: 'image_url' as const,
      image_url: { url: input.referenceUrl },
    },
  ]

  if (
    input.previousVariantUrl &&
    input.previousVariantUrl !== input.referenceUrl
  ) {
    references.push({
      type: 'image_url',
      image_url: { url: input.previousVariantUrl },
    })
  }

  const response = await fetch(OPENROUTER_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': input.config.siteUrl,
      'X-Title': input.config.siteName,
    },
    body: JSON.stringify({
      model: input.config.model,
      prompt,
      n: 1,
      aspect_ratio: input.aspectRatio,
      output_format: 'png',
      input_references: references,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `OpenRouter image generation failed (${response.status}): ${errorText}`,
    )
  }

  const payload = (await response.json()) as OpenRouterImagesResponse

  if (payload.error?.message) {
    throw new Error(payload.error.message)
  }

  const item = payload.data?.[0]
  if (!item) {
    throw new Error(`OpenRouter returned no image for variant ${input.variantIndex + 1}`)
  }

  const mediaType = item.media_type ?? 'image/png'
  let url: string

  if (item.url) {
    url = item.url
  } else if (item.b64_json) {
    url = toDataUrl(item.b64_json, mediaType)
  } else {
    throw new Error(`Image variant ${input.variantIndex + 1} was missing image data`)
  }

  return {
    index: input.variantIndex,
    formatId: input.formatId,
    url,
    mediaType,
  }
}

export interface GenerateCreativeAssetsInput {
  imageBase64: string
  mimeType: string
  platformId: CreativePlatformId
  formatId: CreativeFormatId
  styleId: CreativeStyleId
  paletteId: CreativePaletteId
  count: number
  productNotes?: string
}

/**
 * Calls OpenRouter Images API once per variant so each asset gets a
 * distinct prompt (angle / layout variation). Runs with limited concurrency.
 */
export async function generateCreativeAssets(
  input: GenerateCreativeAssetsInput,
): Promise<{ variants: CreativeVariant[]; model: string }> {
  const config = getImageModelConfig()
  const format = getFormat(input.formatId)
  const referenceUrl = toDataUrl(input.imageBase64, input.mimeType)

  const indices = Array.from({ length: input.count }, (_, i) => i)
  const variants: CreativeVariant[] = []
  const concurrency = 2

  for (let i = 0; i < indices.length; i += concurrency) {
    const batch = indices.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((variantIndex) =>
        generateOneVariant({
          config,
          referenceUrl,
          aspectRatio: format.aspectRatio,
          platformId: input.platformId,
          formatId: input.formatId,
          styleId: input.styleId,
          paletteId: input.paletteId,
          count: input.count,
          variantIndex,
          productNotes: input.productNotes,
        }),
      ),
    )
    variants.push(...batchResults)
  }

  return { variants, model: config.model }
}

export interface RegenerateCreativeAssetInput {
  imageBase64: string
  mimeType: string
  platformId: CreativePlatformId
  formatId: CreativeFormatId
  styleId: CreativeStyleId
  paletteId: CreativePaletteId
  count: number
  variantIndex: number
  productNotes?: string
  editPrompt: string
  previousVariantUrl?: string
}

/** Regenerates a single creative with an edit prompt. */
export async function regenerateCreativeAsset(
  input: RegenerateCreativeAssetInput,
): Promise<{ variant: CreativeVariant; model: string }> {
  const config = getImageModelConfig()
  const format = getFormat(input.formatId)
  const referenceUrl = toDataUrl(input.imageBase64, input.mimeType)

  const variant = await generateOneVariant({
    config,
    referenceUrl,
    aspectRatio: format.aspectRatio,
    platformId: input.platformId,
    formatId: input.formatId,
    styleId: input.styleId,
    paletteId: input.paletteId,
    count: input.count,
    variantIndex: input.variantIndex,
    productNotes: input.productNotes,
    editPrompt: input.editPrompt,
    previousVariantUrl: input.previousVariantUrl,
  })

  return { variant, model: config.model }
}
