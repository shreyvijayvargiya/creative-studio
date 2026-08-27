import { buildCreativeVideoPrompt } from '#/lib/creative-studio/build-video-prompt'
import { getVideoFormat } from '#/lib/creative-studio/video-formats'
import type { GenerateCreativeVideoResult } from '#/types/creative-studio'

const OPENROUTER_VIDEOS_URL = 'https://openrouter.ai/api/v1/videos'

const POLL_INTERVAL_MS = 4000
const MAX_WAIT_MS = 5 * 60 * 1000

interface OpenRouterVideoJob {
  id?: string
  polling_url?: string
  status?: string
  unsigned_urls?: string[]
  error?: string | { message?: string }
}

function getVideoModelConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add it to .env and restart `npm run dev`.',
    )
  }

  return {
    apiKey,
    model:
      process.env.OPENROUTER_VIDEO_MODEL?.trim() || 'google/veo-3.1',
    siteUrl: process.env.APP_URL?.trim() ?? 'http://localhost:3000',
    siteName: 'Kixi',
  }
}

function toDataUrl(imageBase64: string, mimeType: string): string {
  const cleaned = imageBase64.replace(/^data:[^;]+;base64,/i, '')
  return `data:${mimeType};base64,${cleaned}`
}

function jobErrorMessage(error: OpenRouterVideoJob['error']): string {
  if (!error) return 'Video generation failed'
  if (typeof error === 'string') return error
  return error.message?.trim() || 'Video generation failed'
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface GenerateCreativeVideoInput {
  images: Array<{ imageBase64: string; mimeType: string; fileName?: string }>
  formatId: string
  userPrompt: string
}

export async function generateCreativeVideo(
  input: GenerateCreativeVideoInput,
): Promise<GenerateCreativeVideoResult> {
  if (input.images.length === 0) {
    throw new Error('Upload at least one reference image')
  }

  const format = getVideoFormat(input.formatId)
  const config = getVideoModelConfig()
  const prompt = buildCreativeVideoPrompt({
    formatId: format.id,
    userPrompt: input.userPrompt,
    referenceCount: input.images.length,
  })

  const dataUrls = input.images.map((image) =>
    toDataUrl(image.imageBase64, image.mimeType),
  )

  const first = dataUrls[0]!
  const rest = dataUrls.slice(1)
  const last = rest.length > 0 ? rest[rest.length - 1] : undefined
  const middle = rest.length > 1 ? rest.slice(0, -1) : []

  const frameImages: Array<{
    type: 'image_url'
    image_url: { url: string }
    frame_type: 'first_frame' | 'last_frame'
  }> = [
    {
      type: 'image_url',
      image_url: { url: first },
      frame_type: 'first_frame',
    },
  ]

  if (last && last !== first) {
    frameImages.push({
      type: 'image_url',
      image_url: { url: last },
      frame_type: 'last_frame',
    })
  }

  const inputReferences = middle.map((url) => ({
    type: 'image_url' as const,
    image_url: { url },
  }))

  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': config.siteUrl,
    'X-Title': config.siteName,
  }

  const body: Record<string, unknown> = {
    model: config.model,
    prompt,
    duration: format.durationSeconds,
    resolution: format.resolution,
    aspect_ratio: format.aspectRatio,
    generate_audio: format.generateAudio,
    frame_images: frameImages,
  }

  if (inputReferences.length > 0) {
    body.input_references = inputReferences
  }

  const submitVideo = async (payload: Record<string, unknown>) => {
    return fetch(OPENROUTER_VIDEOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  }

  let submit = await submitVideo(body)

  if (submit.status === 400 && (frameImages.length > 1 || inputReferences.length > 0)) {
    submit = await submitVideo({
      model: config.model,
      prompt,
      duration: format.durationSeconds,
      resolution: format.resolution,
      aspect_ratio: format.aspectRatio,
      generate_audio: format.generateAudio,
      frame_images: [frameImages[0]],
    })
  }

  if (!submit.ok) {
    const errorText = await submit.text()
    throw new Error(
      `OpenRouter video generation failed (${submit.status}): ${errorText}`,
    )
  }

  const submitted = (await submit.json()) as OpenRouterVideoJob
  const jobId = submitted.id
  const pollingUrl =
    submitted.polling_url ||
    (jobId ? `${OPENROUTER_VIDEOS_URL}/${jobId}` : undefined)

  if (!jobId || !pollingUrl) {
    throw new Error('OpenRouter did not return a video job id')
  }

  const started = Date.now()
  let job: OpenRouterVideoJob = submitted

  while (job.status !== 'completed') {
    if (['failed', 'cancelled', 'expired'].includes(job.status ?? '')) {
      throw new Error(jobErrorMessage(job.error))
    }
    if (Date.now() - started > MAX_WAIT_MS) {
      throw new Error('Video generation timed out. Try again in a moment.')
    }

    await sleep(POLL_INTERVAL_MS)
    const poll = await fetch(pollingUrl, { headers })
    if (!poll.ok) {
      const errorText = await poll.text()
      throw new Error(`Video status check failed (${poll.status}): ${errorText}`)
    }
    job = (await poll.json()) as OpenRouterVideoJob
  }

  const contentUrl =
    job.unsigned_urls?.[0] ||
    `${OPENROUTER_VIDEOS_URL}/${jobId}/content?index=0`

  const videoResponse = await fetch(contentUrl, { headers })
  if (!videoResponse.ok) {
    const errorText = await videoResponse.text()
    throw new Error(`Failed to download generated video (${videoResponse.status}): ${errorText}`)
  }

  const buffer = Buffer.from(await videoResponse.arrayBuffer())
  if (buffer.byteLength === 0) {
    throw new Error('Generated video was empty')
  }

  const mediaType = videoResponse.headers.get('content-type') || 'video/mp4'

  return {
    url: `data:${mediaType};base64,${buffer.toString('base64')}`,
    mediaType,
    model: config.model,
    formatId: format.id,
    durationSeconds: format.durationSeconds,
    aspectRatio: format.aspectRatio,
  }
}
