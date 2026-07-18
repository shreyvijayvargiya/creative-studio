import { getFormat, getPalette, getPlatform, getStyle } from '#/lib/creative-studio/config'
import type {
  CreativeFormatId,
  CreativePaletteId,
  CreativePlatformId,
  CreativeStyleId,
} from '#/types/creative-studio'

export interface BuildCreativePromptInput {
  platformId: CreativePlatformId
  formatId: CreativeFormatId
  styleId: CreativeStyleId
  paletteId: CreativePaletteId
  count: number
  variantIndex: number
  productNotes?: string
}

/**
 * Detailed system + user prompt so the image model gets dimensions,
 * palette, lighting, platform constraints, and variation instructions.
 */
export function buildCreativeSystemPrompt(input: BuildCreativePromptInput): string {
  const platform = getPlatform(input.platformId)
  const format = getFormat(input.formatId)
  const style = getStyle(input.styleId)
  const palette = getPalette(input.paletteId)

  return `You are an expert ecommerce product photographer and commercial retoucher.

Your job: transform the uploaded product photo into a polished marketplace creative for ${platform.label}.

## Hard rules
- Preserve the exact product identity from the reference image (shape, materials, labels, colours, logos).
- Do not invent text, watermarks, UI chrome, or fake brand marks on the product.
- Output a single photorealistic image — no collage, no split screens, no mock browser frames.
- Keep the product sharp and clearly the hero; avoid cropping critical edges.
- Respect the target canvas: ${format.widthPx}×${format.heightPx}px (${format.aspectRatio}).
- Leave clean negative space where the format needs overlay room (especially banners and stories).

## Platform brief — ${platform.label}
${platform.description}
Format: ${format.label} (${format.ratio})
Use case: ${format.useCase}
Format notes: ${format.description}

## Style brief — ${style.label}
${style.description}
Mood: ${style.mood}
Lighting: ${style.lighting}
Background: ${style.backgroundNotes}

## Colour palette — ${palette.label}
${palette.description}
Scene accents (guide props/background; do not recolour the product itself): ${palette.colors.join(', ')}

## Variation control
This is variant ${input.variantIndex + 1} of ${input.count}.
Vary camera angle, prop arrangement, or subtle background styling across variants while keeping the same product and style family.
Each variant must still be commercially usable on its own.`
}

export function buildCreativeUserPrompt(input: BuildCreativePromptInput): string {
  const platform = getPlatform(input.platformId)
  const format = getFormat(input.formatId)
  const style = getStyle(input.styleId)
  const palette = getPalette(input.paletteId)
  const notes = input.productNotes?.trim()

  return [
    `Edit the attached product photo into a ${format.label} creative.`,
    `Target dimensions: ${format.widthPx}x${format.heightPx} pixels at ${format.aspectRatio} aspect ratio.`,
    `Apply the "${style.label}" scene: ${style.lighting}; background ${style.backgroundNotes}.`,
    `Palette "${palette.label}": ${palette.colors.join(', ')}.`,
    `Commercial quality, high detail, natural materials, ready for ${platform.label}.`,
    notes ? `Seller notes: ${notes}` : null,
    `Variant ${input.variantIndex + 1}/${input.count}: introduce a distinct but on-brief composition.`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Combined prompt for APIs that take a single prompt string (OpenRouter Images). */
export function buildCreativeImagePrompt(input: BuildCreativePromptInput): string {
  return `${buildCreativeSystemPrompt(input)}\n\n---\n\n${buildCreativeUserPrompt(input)}`
}
