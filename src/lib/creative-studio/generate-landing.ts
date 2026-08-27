import {
  buildLandingSystemPrompt,
  buildLandingUserPrompt,
} from '#/lib/creative-studio/build-landing-prompt'
import { LANDING_PARALLELISM } from '#/lib/creative-studio/landing-config'
import { getLandingLayouts } from '#/lib/creative-studio/landing-layouts'
import { readLandingThemePrompt } from '#/lib/creative-studio/landing-themes'
import type {
  GenerateLandingPagesResult,
  GeneratedLandingVariant,
} from '#/types/creative-studio'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

function getLandingModelConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add it to .env and restart `npm run dev`.',
    )
  }

  return {
    apiKey,
    model:
      process.env.OPENROUTER_LANDING_MODEL?.trim() ||
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

export function imagePublicPath(
  index: number,
  fileName: string,
  mimeType: string,
): string {
  const fromName = fileName.match(/\.(png|jpe?g|webp)$/i)?.[1]?.toLowerCase()
  const fromMime = mimeType.replace('image/', '').replace('jpeg', 'jpg')
  const ext = fromName === 'jpeg' ? 'jpg' : (fromName ?? fromMime ?? 'png')
  return `/images/ref-${index + 1}.${ext}`
}

type UserContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >

export function extractLandingPayload(raw: string): {
  title: string
  reactCode: string
  htmlCode: string
} {
  const fencedJson = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedJson?.[1]?.trim() ?? raw.trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')

  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(candidate.slice(start, end + 1)) as {
        title?: unknown
        reactCode?: unknown
        htmlCode?: unknown
      }
      const reactCode = typeof parsed.reactCode === 'string' ? parsed.reactCode.trim() : ''
      const htmlCode = typeof parsed.htmlCode === 'string' ? parsed.htmlCode.trim() : ''
      if (reactCode || htmlCode) {
        return {
          title:
            typeof parsed.title === 'string' && parsed.title.trim()
              ? parsed.title.trim()
              : 'Landing page',
          reactCode,
          htmlCode,
        }
      }
    } catch {
      // Fall through to fenced TSX/HTML.
    }
  }

  const tsx = raw.match(/```(?:tsx|jsx|typescript|ts)?\s*([\s\S]*?)```/i)
  const html = raw.match(/```html\s*([\s\S]*?)```/i)

  return {
    title: 'Landing page',
    reactCode: tsx?.[1]?.trim() ?? '',
    htmlCode: html?.[1]?.trim() ?? '',
  }
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

async function requestLandingVariant(input: {
  config: ReturnType<typeof getLandingModelConfig>
  system: string
  user: UserContent
}): Promise<{ title: string; reactCode: string; htmlCode: string }> {
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
      temperature: 0.7,
      max_tokens: 12000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter landing request failed (${response.status}): ${errorText}`)
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
    throw new Error('Empty landing page response')
  }

  const extracted = extractLandingPayload(content)
  if (!extracted.reactCode && !extracted.htmlCode) {
    throw new Error('Model did not return landing page code')
  }

  return extracted
}

export interface GenerateLandingPagesInput {
  themeId: string
  userPrompt: string
  count: number
  images: Array<{ imageBase64: string; mimeType: string; fileName: string }>
}

export async function generateLandingPages(
  input: GenerateLandingPagesInput,
): Promise<GenerateLandingPagesResult> {
  const config = getLandingModelConfig()
  const { meta, prompt: themePrompt } = await readLandingThemePrompt(input.themeId)
  const layouts = getLandingLayouts(input.count)
  const system = buildLandingSystemPrompt()
  const imagePaths = input.images.map((image, index) =>
    imagePublicPath(index, image.fileName, image.mimeType),
  )
  const referenceUrls = input.images.map((image) =>
    toDataUrl(image.imageBase64, image.mimeType),
  )

  const variants = await mapPool(layouts, LANDING_PARALLELISM, async (layout, index) => {
    const text = buildLandingUserPrompt({
      theme: meta,
      themePrompt,
      layout,
      userPrompt: input.userPrompt,
      imagePaths,
      variantIndex: index,
      variantCount: layouts.length,
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
      const generated = await requestLandingVariant({ config, system, user })
      const variant: GeneratedLandingVariant = {
        index,
        layoutId: layout.id,
        label: layout.label,
        title: generated.title,
        reactCode: generated.reactCode || undefined,
        htmlCode: generated.htmlCode || undefined,
      }
      return variant
    } catch (error) {
      const variant: GeneratedLandingVariant = {
        index,
        layoutId: layout.id,
        label: layout.label,
        error: error instanceof Error ? error.message : 'Landing generation failed',
      }
      return variant
    }
  })

  const succeeded = variants.filter((item) => item.reactCode || item.htmlCode).length
  if (succeeded === 0) {
    throw new Error(variants[0]?.error || 'Landing page generation failed')
  }

  return {
    variants,
    model: config.model,
    themeId: meta.id,
    themeName: meta.name,
    count: succeeded,
    imagePaths,
  }
}
