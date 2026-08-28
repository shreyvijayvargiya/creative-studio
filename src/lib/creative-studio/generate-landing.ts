import {
  buildLandingRevisePrompt,
  buildLandingSystemPrompt,
  buildLandingUserPrompt,
} from '#/lib/creative-studio/build-landing-prompt'
import { getLandingLayout, getLandingLayouts } from '#/lib/creative-studio/landing-layouts'
import { readLandingThemePrompt } from '#/lib/creative-studio/landing-themes'
import type {
  GenerateLandingPagesResult,
  GeneratedLandingVariant,
  LandingStoredImage,
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

export { imagePublicPath } from '#/lib/creative-studio/landing-images'

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
  chatReply?: string
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
        chatReply?: unknown
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
          chatReply:
            typeof parsed.chatReply === 'string' && parsed.chatReply.trim()
              ? parsed.chatReply.trim()
              : undefined,
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

function visionUserContent(
  text: string,
  images: Array<{ imageBase64: string; mimeType: string }>,
): UserContent {
  return [
    { type: 'text', text },
    ...images.map((image) => ({
      type: 'image_url' as const,
      image_url: { url: toDataUrl(image.imageBase64, image.mimeType) },
    })),
  ]
}

async function requestLandingVariant(input: {
  config: ReturnType<typeof getLandingModelConfig>
  system: string
  user: UserContent
}): Promise<{ title: string; reactCode: string; htmlCode: string; chatReply?: string }> {
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
  images: Array<{ imageBase64: string; mimeType: string; fileName: string }>
  storedImages: LandingStoredImage[]
}

export async function generateLandingPages(
  input: GenerateLandingPagesInput,
): Promise<GenerateLandingPagesResult> {
  const config = getLandingModelConfig()
  const { meta, prompt: themePrompt } = await readLandingThemePrompt(input.themeId)
  const layout = getLandingLayouts(1)[0]

  const imagePaths = input.storedImages.map((image) => image.publicPath)
  const text = buildLandingUserPrompt({
    theme: meta,
    themePrompt,
    layout,
    userPrompt: input.userPrompt,
    imagePaths,
  })
  const generated = await requestLandingVariant({
    config,
    system: buildLandingSystemPrompt(),
    user: visionUserContent(text, input.images),
  })

  if (!generated.reactCode && !generated.htmlCode) {
    throw new Error('Landing page generation failed')
  }

  return {
    variants: [
      {
        index: 0,
        layoutId: layout.id,
        label: layout.label,
        title: generated.title,
        reactCode: generated.reactCode || undefined,
        htmlCode: generated.htmlCode || undefined,
      },
    ],
    model: config.model,
    themeId: meta.id,
    themeName: meta.name,
    count: 1,
    imagePaths,
    storedImages: input.storedImages,
  }
}

export interface ReviseLandingPageInput {
  themeId: string
  userPrompt: string
  editPrompt: string
  layoutId: string
  previousTitle?: string
  previousReactCode?: string
  previousHtmlCode?: string
  images: Array<{ imageBase64: string; mimeType: string; fileName: string }>
  storedImages: LandingStoredImage[]
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface ReviseLandingPageResult {
  variant: GeneratedLandingVariant
  chatReply: string
  model: string
  storedImages: LandingStoredImage[]
}

export async function reviseLandingPage(
  input: ReviseLandingPageInput,
): Promise<ReviseLandingPageResult> {
  const config = getLandingModelConfig()
  const { meta, prompt: themePrompt } = await readLandingThemePrompt(input.themeId)
  const layout = getLandingLayout(input.layoutId) ?? getLandingLayouts(1)[0]

  const imagePaths = input.storedImages.map((image) => image.publicPath)
  const text = buildLandingRevisePrompt({
    theme: meta,
    themePrompt,
    layout,
    userPrompt: input.userPrompt,
    editPrompt: input.editPrompt,
    previousTitle: input.previousTitle,
    previousReactCode: input.previousReactCode,
    previousHtmlCode: input.previousHtmlCode,
    imagePaths,
    chatHistory: input.chatHistory,
  })
  const generated = await requestLandingVariant({
    config,
    system: buildLandingSystemPrompt(),
    user: visionUserContent(text, input.images),
  })
  if (!generated.reactCode && !generated.htmlCode) {
    throw new Error('Model did not return an updated landing page')
  }

  return {
    variant: {
      index: 0,
      layoutId: layout.id,
      label: layout.label,
      title: generated.title,
      reactCode: generated.reactCode || input.previousReactCode,
      htmlCode: generated.htmlCode || input.previousHtmlCode,
    },
    chatReply: generated.chatReply || 'Updated the landing page.',
    model: config.model,
    storedImages: input.storedImages,
  }
}
