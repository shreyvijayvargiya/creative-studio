import {
  buildLogoSystemPrompt,
  buildLogoUserPrompt,
} from '#/lib/creative-studio/build-logo-prompt'
import { LOGO_PARALLELISM, LOGO_STYLES } from '#/lib/creative-studio/logo-styles'
import type { GenerateCreativeLogosResult, GeneratedLogoVariant } from '#/types/creative-studio'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

function getLogoModelConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add it to .env and restart `npm run dev`.',
    )
  }

  return {
    apiKey,
    model:
      process.env.OPENROUTER_LOGO_MODEL?.trim() ||
      process.env.OPENROUTER_MODEL?.trim() ||
      'google/gemini-2.5-flash',
    siteUrl: process.env.APP_URL?.trim() ?? 'http://localhost:3000',
    siteName: 'Kixi',
  }
}

function toDataUrl(imageBase64: string, mimeType: string): string {
  const cleaned = imageBase64.replace(/^data:[^;]+;base64,/i, '')
  return `data:${mimeType};base64,${cleaned}`
}

export function extractSvgMarkup(raw: string): string {
  const fenced = raw.match(/```(?:svg)?\s*([\s\S]*?)```/i)
  const source = fenced?.[1] ?? raw
  const match = source.match(/<svg\b[\s\S]*?<\/svg>/i)
  if (!match) {
    throw new Error('Model did not return SVG markup')
  }

  let svg = match[0]
  svg = svg.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  svg = svg.replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, '')
  svg = svg.replace(/<image\b[\s\S]*?<\/image>/gi, '')
  svg = svg.replace(/\son[a-z]+="[^"]*"/gi, '')
  svg = svg.replace(/\son[a-z]+='[^']*'/gi, '')
  svg = svg.replace(/javascript:/gi, '')

  if (!/\sxmlns=/.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  if (!/\sviewBox=/.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg viewBox="0 0 256 256"')
  }

  return svg.trim()
}

type UserContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >

async function requestLogoSvg(input: {
  config: ReturnType<typeof getLogoModelConfig>
  system: string
  user: UserContent
}): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': input.config.siteUrl,
      'X-Title': input.config.siteName,
    },
    body: JSON.stringify({
      model: input.config.model,
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
      temperature: 0.85,
      max_tokens: 2500,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter logo request failed (${response.status}): ${errorText}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>
    error?: { message?: string }
  }

  if (payload.error?.message) {
    throw new Error(payload.error.message)
  }

  const content = payload.choices?.[0]?.message?.content
  if (!content?.trim()) {
    throw new Error('Empty logo response')
  }

  return extractSvgMarkup(content)
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      const item = items[index]
      if (item === undefined) continue
      results[index] = await mapper(item, index)
    }
  }

  const pool = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(pool)
  return results
}

export interface GenerateCreativeLogosInput {
  brandName?: string
  userPrompt: string
  images: Array<{ imageBase64: string; mimeType: string; fileName?: string }>
}

export async function generateCreativeLogos(
  input: GenerateCreativeLogosInput,
): Promise<GenerateCreativeLogosResult> {
  const config = getLogoModelConfig()
  const system = buildLogoSystemPrompt()
  const referenceUrls = input.images.map((image) =>
    toDataUrl(image.imageBase64, image.mimeType),
  )

  const logos = await mapPool(LOGO_STYLES, LOGO_PARALLELISM, async (style) => {
    const text = buildLogoUserPrompt({
      style,
      brandName: input.brandName,
      userPrompt: input.userPrompt,
      hasReferences: referenceUrls.length > 0,
    })

    const user: UserContent =
      referenceUrls.length === 0
        ? text
        : [
            { type: 'text', text },
            ...referenceUrls.map((url) => ({
              type: 'image_url' as const,
              image_url: { url },
            })),
          ]

    try {
      const svg = await requestLogoSvg({ config, system, user })
      const variant: GeneratedLogoVariant = {
        styleId: style.id,
        label: style.label,
        svg,
      }
      return variant
    } catch (error) {
      const variant: GeneratedLogoVariant = {
        styleId: style.id,
        label: style.label,
        error: error instanceof Error ? error.message : 'Logo generation failed',
      }
      return variant
    }
  })

  const succeeded = logos.filter((logo) => logo.svg).length
  if (succeeded === 0) {
    throw new Error(logos[0]?.error || 'Logo generation failed')
  }

  return {
    logos,
    model: config.model,
    count: succeeded,
  }
}
